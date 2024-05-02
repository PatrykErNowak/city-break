import { useEffect, useRef } from 'react';

export default function MessagesBox({ scrollTrigger, children }) {
  const ref = useRef(null);

  useEffect(() => {
    if (scrollTrigger) {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [scrollTrigger]);

  return (
    <div className="lg:max-h-[62vh] overflow-auto self">
      {children}
      <div ref={ref}></div>
    </div>
  );
}
