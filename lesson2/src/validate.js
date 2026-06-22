// Validates the built .sb3 with Scratch's official parser.
// Catches structural issues before they get pushed.
const fs = require('fs');
const path = require('path');
const parser = require('scratch-parser');

const SB3 = path.join(__dirname, '..', 'Lesson2_BattleCity.sb3');
const data = fs.readFileSync(SB3);

parser(data, false, (err, project) => {
  if (err) {
    console.error('❌ sb3 parse FAILED:');
    console.error(JSON.stringify(err, null, 2).slice(0, 2000));
    process.exit(1);
  }
  const targets = project[0].targets;
  const stage = targets.find(t => t.isStage);
  console.log(`✓ parsed OK · ${targets.length} targets`);
  console.log(`✓ stage has ${stage.costumes.length} backdrops:`);
  stage.costumes.forEach((c, i) => {
    console.log(`    ${i}. ${c.name}  (${c.md5ext})`);
  });
  targets.filter(t => !t.isStage).forEach(t => {
    const scripts = Object.values(t.blocks).filter(b => b.topLevel).length;
    console.log(`✓ sprite "${t.name}":  ${t.costumes.length} costume(s), ${(t.sounds || []).length} sound(s), ${scripts} script(s)`);
  });
});
