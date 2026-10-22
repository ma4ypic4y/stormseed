#!/usr/bin/env python3
"""Derive a small, traceable snapshot from public NOAA GLM Level 2 files."""
import argparse, hashlib, json, math, os, sys, time, urllib.request, urllib.parse
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone
from pathlib import Path
import netCDF4
import numpy as np

UTC = timezone.utc
NS = {'s': 'http://s3.amazonaws.com/doc/2006-03-01/'}

def get(url):
    for attempt in range(3):
        try:
            request = urllib.request.Request(url, headers={'User-Agent': 'Stormseed/1.0 (open-source NOAA data experiment)'})
            with urllib.request.urlopen(request, timeout=45) as response:
                return response.read()
        except Exception:
            if attempt == 2: raise
            time.sleep(2 ** attempt)

def iso(dt):
    return dt.isoformat(timespec='milliseconds').replace('+00:00', 'Z')

def latest_keys(satellite, now):
    keys = []
    for hours in range(3):
        date = now - timedelta(hours=hours)
        prefix = f'GLM-L2-LCFA/{date:%Y}/{date:%j}/{date:%H}/'
        url = f'https://noaa-goes{satellite}.s3.amazonaws.com/?' + urllib.parse.urlencode({'list-type':2, 'prefix':prefix})
        root = ET.fromstring(get(url))
        keys += [node.text for node in root.findall('.//s:Key', NS) if node.text.endswith('.nc')]
        if len(keys) >= 2: break
    return sorted(set(keys))[-2:]

def collect():
    now = datetime.now(UTC)
    sources, flashes, failures = [], [], []
    for satellite in (19, 18):
        try:
            keys = latest_keys(satellite, now)
            if not keys: raise ValueError('No recent source files')
            for key in keys:
                url = f'https://noaa-goes{satellite}.s3.amazonaws.com/{key}'
                raw = get(url)
                with netCDF4.Dataset('glm.nc', memory=raw) as data:
                    start, end = data.time_coverage_start, data.time_coverage_end
                    if (now - datetime.strptime(end, '%Y-%m-%dT%H:%M:%S.%fZ').replace(tzinfo=UTC)).total_seconds() > 3 * 3600:
                        raise ValueError('Source observation is older than three hours')
                    idx = len(sources)
                    sources.append({'satellite':f'GOES-{satellite}', 'url':url, 'sha256':hashlib.sha256(raw).hexdigest(), 'bytes':len(raw), 'start':start, 'end':end})
                    times = data['flash_time_offset_of_first_event']
                    variables = {name: data[name][:] for name in ['flash_id','flash_lat','flash_lon','flash_energy','flash_quality_flag']}
                    for i in range(len(variables['flash_id'])):
                        values = [variables[name][i] for name in variables]
                        if any(np.ma.is_masked(v) or not math.isfinite(float(v)) for v in values): continue
                        if int(variables['flash_quality_flag'][i]) != 0: continue
                        lat, lon = float(variables['flash_lat'][i]), float(variables['flash_lon'][i])
                        if not (-90 <= lat <= 90 and -180 <= lon <= 180): continue
                        offset = times[i]
                        if np.ma.is_masked(offset) or not math.isfinite(float(offset)): continue
                        date = netCDF4.num2date(offset, times.units, only_use_cftime_datetimes=False)
                        flashes.append({'source':idx,'id':int(variables['flash_id'][i]),'time':date.isoformat(timespec='milliseconds')+'Z','lat':round(lat,5),'lon':round(lon,5),'energyJ':float(variables['flash_energy'][i])})
        except Exception as exc:
            failures.append(f'GOES-{satellite}: {type(exc).__name__}: {exc}')
    if not sources or not flashes:
        raise RuntimeError('No usable observations; preserving previous snapshot. ' + '; '.join(failures))
    payload = {'version':1,'collectedAt':iso(now),'observedStart':min(s['start'] for s in sources),'observedEnd':max(s['end'] for s in sources),'coverage':'GOES East / West field of view; not global coverage','sources':sources,'flashes':flashes,'warnings':failures}
    material = json.dumps(payload, ensure_ascii=True, separators=(',',':'), allow_nan=False)
    return {'material':material,'digest':hashlib.sha256(material.encode('utf-8')).hexdigest()}

if __name__ == '__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--output',default='public/data/lightning.json');args=parser.parse_args()
    snapshot=collect(); path=Path(args.output);path.parent.mkdir(parents=True,exist_ok=True)
    tmp=path.with_suffix('.tmp');tmp.write_text(json.dumps(snapshot,separators=(',',':'))+'\n');os.replace(tmp,path)
    data=json.loads(snapshot['material']); print(f"Saved {len(data['flashes'])} quality-filtered observations from {len(data['sources'])} files; latest {data['observedEnd']}")
    for warning in data['warnings']: print(warning,file=sys.stderr)
