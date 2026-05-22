export default function RootLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-[120px] w-[200px] scale-75">
          <div className="loader">
            <span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </span>
            <div className="base">
              <span></span>
              <div className="face"></div>
            </div>
          </div>
        </div>
        <p className="font-display text-sm font-bold uppercase tracking-widest text-muted-foreground animate-pulse-soft">
          Loading PayFlow
        </p>
        <style>{`
          .loader { position: absolute; top: 50%; margin-left: -50px; left: 50%; animation: speeder 0.4s linear infinite; }
          .loader > span { height: 5px; width: 35px; background: #1E293B; position: absolute; top: -19px; left: 60px; border-radius: 2px 10px 1px 0; }
          .base span { position: absolute; width: 0; height: 0; border-top: 6px solid transparent; border-right: 100px solid #1E293B; border-bottom: 6px solid transparent; }
          .base span:before { content: ""; height: 22px; width: 22px; border-radius: 50%; background: #1E293B; position: absolute; right: -110px; top: -16px; }
          .base span:after { content: ""; position: absolute; width: 0; height: 0; border-top: 0 solid transparent; border-right: 55px solid #1E293B; border-bottom: 16px solid transparent; top: -16px; right: -98px; }
          .face { position: absolute; height: 12px; width: 20px; background: #1E293B; border-radius: 20px 20px 0 0; transform: rotate(-40deg); right: -125px; top: -15px; }
          .face:after { content: ""; height: 12px; width: 12px; background: #1E293B; right: 4px; top: 7px; position: absolute; transform: rotate(40deg); transform-origin: 50% 50%; border-radius: 0 0 0 2px; }
          .loader > span > span:nth-child(1), .loader > span > span:nth-child(2), .loader > span > span:nth-child(3), .loader > span > span:nth-child(4) { width: 30px; height: 1px; background: #1E293B; position: absolute; animation: fazer1 0.2s linear infinite; }
          .loader > span > span:nth-child(2) { top: 3px; animation: fazer2 0.4s linear infinite; }
          .loader > span > span:nth-child(3) { top: 1px; animation: fazer3 0.4s linear infinite; animation-delay: -1s; }
          .loader > span > span:nth-child(4) { top: 4px; animation: fazer4 1s linear infinite; animation-delay: -1s; }
          @keyframes fazer1 { 0% { left: 0; } 100% { left: -80px; opacity: 0; } }
          @keyframes fazer2 { 0% { left: 0; } 100% { left: -100px; opacity: 0; } }
          @keyframes fazer3 { 0% { left: 0; } 100% { left: -50px; opacity: 0; } }
          @keyframes fazer4 { 0% { left: 0; } 100% { left: -150px; opacity: 0; } }
          @keyframes speeder { 0% { transform: translate(2px,1px) rotate(0deg); } 10% { transform: translate(-1px,-3px) rotate(-1deg); } 20% { transform: translate(-2px,0px) rotate(1deg); } 30% { transform: translate(1px,2px) rotate(0deg); } 40% { transform: translate(1px,-1px) rotate(1deg); } 50% { transform: translate(-1px,3px) rotate(-1deg); } 60% { transform: translate(-1px,1px) rotate(0deg); } 70% { transform: translate(3px,1px) rotate(-1deg); } 80% { transform: translate(-2px,-1px) rotate(1deg); } 90% { transform: translate(2px,1px) rotate(0deg); } 100% { transform: translate(1px,-2px) rotate(-1deg); } }
          @media (prefers-reduced-motion: reduce) { .loader { animation: none; } .loader > span > span { animation: none; } }
        `}</style>
      </div>
    </div>
  );
}
