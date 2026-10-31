from pathlib import Path
import runpy,sys,shutil
root=Path(__file__).resolve().parents[1]
source=root/'src/apwh';sys.path.insert(0,str(source))
runpy.run_path(str(source/'build.py'),run_name='__main__')

for package in ['u1-comparison','u2-visual']:
 target=root/'assets'/('apwh-'+package)
 shutil.rmtree(target,ignore_errors=True)
 shutil.copytree(root/'src/workspace'/package,target,ignore=shutil.ignore_patterns('*.test.cjs','*.md','__pycache__'))
shutil.copy2(root/'src/workspace/u1-integration.js',root/'assets/apwh-u1-integration.js')
out=root/'_site';shutil.rmtree(out,ignore_errors=True);out.mkdir()
for name in ['index.html','world-map.html','module-bridge.mjs','module-protocol.mjs','favorites.mjs','assets','data']:
 p=root/name
 if p.is_dir():shutil.copytree(p,out/name)
 else:shutil.copy2(p,out/name)
(out/'.nojekyll').touch()
