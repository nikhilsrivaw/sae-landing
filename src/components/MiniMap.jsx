import React from "react";
import { motion } from "framer-motion";
import mapBg from "../assets/mapBackground.png";

const MiniMap = () => {
  return (
    <div className="fixed bottom-[2px] left-[2px] z-20">
      <div
        className="w-32 sm:w-52 h-24 sm:h-40 relative overflow-hidden rounded-lg sm:rounded-xl border-2 border-white/20 bg-black/30 backdrop-blur-lg"
        style={{
          boxShadow:
            "rgba(0,0,0,0.7) 0px 0px 30px, rgba(0,0,0,0.4) 0px 0px 12px inset",
        }}
      >
        {/* Map background */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: `url(${mapBg})`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            filter: "brightness(0.6) contrast(1.2) saturate(0.7)",
          }}
        ></div>

        {/* N and Phone icons */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-4 left-4 w-6 h-6 bg-green-600 flex items-center justify-center text-white text-xs font-bold border border-black shadow-[0_0_0_1px_rgba(255,255,255,0.8)]">
            N
          </div>
          <div className="absolute bottom-4 right-4 w-6 h-6 bg-blue-600 flex items-center justify-center text-white text-xs font-bold border border-black shadow-[0_0_0_1px_rgba(255,255,255,0.8)]">
            📱
          </div>
        </div>

        {/* Arrow pointer */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30">
          <div
            className="w-0 h-0"
            style={{
              borderLeft: "8px solid transparent",
              borderRight: "8px solid transparent",
              borderBottom: "16px solid white",
              filter:
                "drop-shadow(0px 0px 8px white) drop-shadow(0px 2px 6px rgba(0,0,0,0.9))",
            }}
          ></div>
        </div>

        {/* Animated "S" Marker */}
        <motion.div
          className="absolute top-[62%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
          animate={{ y: [0, -8, 0] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="w-3 h-3 bg-yellow-400 rounded-full border border-black relative shadow-[0_0_0_1px_rgba(255,255,255,0.8)]">
            <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-black">
              S
            </div>
          </div>
        </motion.div>

        {/* Other markers */}
        <div
          className="absolute top-[45%] left-[58%] w-2.5 h-2.5 bg-red-500 rounded-full border border-black shadow-[0_0_0_1px_rgba(255,255,255,0.8)]"
          title="Street Race"
        ></div>
        <div
          className="absolute top-[70%] left-[55%] w-2.5 h-2.5 bg-green-500 rounded-full border border-black shadow-[0_0_0_1px_rgba(255,255,255,0.8)]"
          title="Mod Shop"
        ></div>
        <div
          className="absolute top-[55%] left-[45%] w-2.5 h-2.5 bg-blue-500 rounded-full border border-black shadow-[0_0_0_1px_rgba(255,255,255,0.8)]"
          title="Garage"
        ></div>
        <div
          className="absolute top-[65%] left-[42%] w-2.5 h-2.5 bg-pink-500 rounded-full border border-black shadow-[0_0_0_1px_rgba(255,255,255,0.8)]"
          title="Benny's"
        ></div>
        <div
          className="absolute top-[40%] left-[75%] w-2 h-2 bg-white rounded-full border border-black shadow-[0_0_0_1px_rgba(0,0,0,0.5)]"
          title="Airfield"
        ></div>
      </div>
    </div>
  );
};

export default MiniMap;
