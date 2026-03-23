import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useEstablishmentId } from '../useEstablishmentId';

function createWrapper(initialPath: string) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/establishments/:establishmentId/*" element={children} />
          <Route path="/establishments" element={<div>picker</div>} />
        </Routes>
      </MemoryRouter>
    );
  };
}

describe('useEstablishmentId', () => {
  it('returns establishmentId when present in URL', () => {
    const { result } = renderHook(() => useEstablishmentId(), {
      wrapper: createWrapper('/establishments/abc123/orders'),
    });

    expect(result.current).toEqual({ establishmentId: 'abc123' });
  });

  it('returns null when establishmentId is missing', () => {
    function WrapperNoParam({ children }: { children: ReactNode }) {
      return (
        <MemoryRouter initialEntries={['/other']}>
          <Routes>
            <Route path="/other" element={children} />
          </Routes>
        </MemoryRouter>
      );
    }

    const { result } = renderHook(() => useEstablishmentId(), {
      wrapper: WrapperNoParam,
    });

    expect(result.current).toBeNull();
  });
});
