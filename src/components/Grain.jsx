import React from 'react';

const Grain = () => (
  <div
    aria-hidden="true"
    className="pointer-events-none fixed inset-0 z-[60] grain-layer mix-blend-overlay opacity-[0.06]"
  />
);

export default Grain;
