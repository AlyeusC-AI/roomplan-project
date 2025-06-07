"use client";

import { motion } from "framer-motion";

export default function Page() {
  return (
    <div className='flex h-screen w-full items-center justify-center bg-background'>
      <div className='flex flex-col items-center space-y-4'>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: 0.5,
            ease: "easeOut",
          }}
          className='relative'
        >
          <div className='h-16 w-16 rounded-full border-4 border-primary/20'>
            <motion.div
              className='absolute inset-0 rounded-full border-4 border-primary'
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 1.5,
                ease: "linear",
                repeat: Infinity,
              }}
            />
          </div>
        </motion.div>
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            delay: 0.2,
            duration: 0.5,
          }}
          className='text-xl font-semibold text-foreground'
        >
          RestoreGeek
        </motion.h1>
      </div>
    </div>
  );
}
