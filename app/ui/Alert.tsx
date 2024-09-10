import React, { useEffect, useState } from "react";

type Props = {
  children: React.ReactNode,
  className?: string,
  position?: 'top' | 'bottom',
  type?: 'fixed' | 'absolute'
}

function Alert({ children, className, position = 'bottom', type = 'absolute' }: Props) {
  const [render, setRender] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setRender(false);
    }, 5000);
  }, []);

  if (!render) return null;

  return (
    <div
      className={`${type} ${position === 'top' ? 'top-10' : 'bottom-0'} left-1/2 -translate-x-1/2 bg-primary py-2.5 px-5 whitespace-nowrap rounded text-foreground flex items-center justify-center z-50 ${className}`}
    >
      <span>
        {children}
      </span>
    </div>
  )
}

export default Alert;
