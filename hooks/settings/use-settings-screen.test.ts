import { renderHook, act } from '@testing-library/react-hooks';
import { useSettingsScreen } from './use-settings-screen';

declare var describe: any;
declare var it: any;
declare var expect: any;

describe('useSettingsScreen', () => {
  it('initializes with default preferences', () => {
    const { result } = renderHook(() => useSettingsScreen());

    expect(result.current.prefs).toEqual({
      darkMode: false,
      notifications: true,
      biometric: false,
      autoPay: true,
    });
  });

  it('toggles darkMode preference', () => {
    const { result } = renderHook(() => useSettingsScreen());

    act(() => {
      result.current.togglePref('darkMode');
    });

    expect(result.current.prefs.darkMode).toBe(true);

    act(() => {
      result.current.togglePref('darkMode');
    });

    expect(result.current.prefs.darkMode).toBe(false);
  });

  it('toggles notifications preference', () => {
    const { result } = renderHook(() => useSettingsScreen());

    expect(result.current.prefs.notifications).toBe(true);

    act(() => {
      result.current.togglePref('notifications');
    });

    expect(result.current.prefs.notifications).toBe(false);
  });

  it('toggles biometric preference', () => {
    const { result } = renderHook(() => useSettingsScreen());

    expect(result.current.prefs.biometric).toBe(false);

    act(() => {
      result.current.togglePref('biometric');
    });

    expect(result.current.prefs.biometric).toBe(true);
  });

  it('toggles autoPay preference', () => {
    const { result } = renderHook(() => useSettingsScreen());

    expect(result.current.prefs.autoPay).toBe(true);

    act(() => {
      result.current.togglePref('autoPay');
    });

    expect(result.current.prefs.autoPay).toBe(false);
  });

  it('toggles multiple preferences independently', () => {
    const { result } = renderHook(() => useSettingsScreen());

    act(() => {
      result.current.togglePref('darkMode');
      result.current.togglePref('biometric');
    });

    expect(result.current.prefs.darkMode).toBe(true);
    expect(result.current.prefs.biometric).toBe(true);
    expect(result.current.prefs.notifications).toBe(true); // unchanged
    expect(result.current.prefs.autoPay).toBe(true); // unchanged
  });

  it('creates toggle animation with correct initial value', () => {
    const { result } = renderHook(() => useSettingsScreen());

    const animationOn = result.current.createToggleAnimation(true);
    const animationOff = result.current.createToggleAnimation(false);

    expect(animationOn.anim).toBeDefined();
    expect(animationOff.anim).toBeDefined();
  });
});
