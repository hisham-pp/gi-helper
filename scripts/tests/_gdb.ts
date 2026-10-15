import gdb from "genshin-db";
for (const n of process.argv.slice(2)) { const w = gdb.weapons(n); console.log(n, w?.images.filename_icon, w?.images.filename_awakenIcon, w?.version); }
