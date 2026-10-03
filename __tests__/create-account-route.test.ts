import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Regression guard for the `app/create-account.tsx` Expo Router route.
 *
 * The route used to build a fake React Navigation object
 * (`{ goBack, navigate }`) and pass it as a `navigation` prop that
 * CreateAccountScreen never declared. That silently broke two behaviours:
 * the back chevron did nothing, and successful registration never left the
 * auth screens. The screen's real contract is `onBack` / `onSuccess`.
 *
 * These assertions are intentionally source-level. They pin the wiring
 * conventions this route must keep (Expo Router callbacks, no `as any`)
 * without pulling a component-rendering dependency into the test suite.
 */

const routePath = join(__dirname, '..', 'app', 'create-account.tsx');
const source = readFileSync(routePath, 'utf8');

describe('app/create-account.tsx route wiring', () => {
  it('passes onBack wired to router.back()', () => {
    expect(source).toMatch(/onBack=\{\(\)\s*=>\s*router\.back\(\)\}/);
  });

  it('passes onSuccess wired to router.replace("/(tabs)")', () => {
    expect(source).toMatch(/onSuccess=\{\(\)\s*=>\s*router\.replace\(['"]\/\(tabs\)['"]\)\}/);
  });

  it('does not build a mock React Navigation object', () => {
    expect(source).not.toMatch(/navigation\s*=\s*\{/);
    expect(source).not.toMatch(/navigation=\{navigation\}/);
    expect(source).not.toMatch(/goBack:\s*\(\)\s*=>/);
    expect(source).not.toMatch(/navigate:\s*\(/);
  });

  it('does not use the "as any" escape hatch', () => {
    expect(source).not.toMatch(/\bas any\b/);
    expect(source).not.toMatch(/@ts-ignore|@ts-expect-error/);
  });

  it('renders CreateAccountScreen through Expo Router only', () => {
    expect(source).toMatch(/from 'expo-router'/);
    expect(source).toMatch(/const router = useRouter\(\)/);
    expect(source).toMatch(/<CreateAccountScreen/);
  });
});
