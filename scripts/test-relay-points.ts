import 'dotenv/config';
import { fetchBoxtalRelayPoints } from '../src/lib/boxtal';

async function main() {
  // Test a few real postal codes
  const tests = [
    { postal: '75001', carrier: undefined, label: 'Paris 75001, all carriers' },
    { postal: '27730', carrier: 'mondial_relay', label: 'BUEIL 27730, Mondial Relay only' },
    { postal: '27730', carrier: 'chronopost', label: 'BUEIL 27730, Chronopost only' },
    { postal: '27000', carrier: undefined, label: 'Évreux 27000, all carriers' },
    { postal: '69001', carrier: undefined, label: 'Lyon 69001, all carriers' },
  ];

  for (const t of tests) {
    const start = Date.now();
    const points = await fetchBoxtalRelayPoints(t.postal, 'FR', t.carrier);
    const ms = Date.now() - start;
    console.log(`\n=== ${t.label} (${ms}ms) ===`);
    console.log(`  ${points.length} points`);
    points.slice(0, 3).forEach(p => {
      console.log(`  - [${p.carrier}] ${p.name} — ${p.address}, ${p.postalCode} ${p.city} — ${p.distance || '?'} — code ${p.code}`);
    });
  }
}

main().catch(e => { console.error(e); process.exit(1); });
