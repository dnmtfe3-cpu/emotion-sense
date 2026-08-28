import { readFile, writeFile, mkdir, copyFile, access } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const androidRoot = path.join(root, 'android', 'app', 'src', 'main');
const manifestPath = path.join(androidRoot, 'AndroidManifest.xml');
const iconSource = path.join(root, 'icon-192.png');
const iconDir = path.join(androidRoot, 'res', 'drawable-nodpi');
const iconTarget = path.join(iconDir, 'emotion_icon.png');

await access(manifestPath);
await mkdir(iconDir, { recursive: true });
await copyFile(iconSource, iconTarget);

let manifest = await readFile(manifestPath, 'utf8');

if (!manifest.includes('android.permission.CAMERA')) {
  manifest = manifest.replace(
    '<!-- Permissions -->',
    '<!-- Permissions -->\n    <uses-permission android:name="android.permission.CAMERA" />\n    <uses-feature android:name="android.hardware.camera.front" android:required="false" />'
  );
}

manifest = manifest
  .replace('android:icon="@mipmap/ic_launcher"', 'android:icon="@drawable/emotion_icon"')
  .replace('android:roundIcon="@mipmap/ic_launcher_round"', 'android:roundIcon="@drawable/emotion_icon"')
  .replace('android:theme="@style/AppTheme.NoActionBarLaunch"', 'android:theme="@style/AppTheme.NoActionBar"');

await writeFile(manifestPath, manifest);

const stringsPath = path.join(androidRoot, 'res', 'values', 'strings.xml');
try {
  let strings = await readFile(stringsPath, 'utf8');
  strings = strings
    .replace(/<string name="app_name">[\s\S]*?<\/string>/, '<string name="app_name">Emotion Sense</string>')
    .replace(/<string name="title_activity_main">[\s\S]*?<\/string>/, '<string name="title_activity_main">Emotion Sense</string>');
  await writeFile(stringsPath, strings);
} catch {}

console.log('Android configurado: câmera, nome, ícone oficial e sem splash customizada.');
