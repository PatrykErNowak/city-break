import { useRef } from 'react';

export default function MessagesBox({ children }) {
  const ref = useRef(null);
  ref.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  return (
    <div className="lg:max-h-[62vh] overflow-auto self">
      {children}
      <div ref={ref}></div>
    </div>
  );
}
