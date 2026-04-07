import { useEffect, useRef } from 'react'

function StarField() {
  const canvasRef = useRef()

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // Create stars
    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      opacity: Math.random(),
      speed: Math.random() * 0.003 + 0.001,
      color: Math.random() > 0.85 ? '#00FFD1' : '#ffffff',
    }))

    let animId

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      stars.forEach(star => {
        star.opacity += star.speed
        if (star.opacity > 1 || star.opacity < 0) star.speed *= -1

        ctx.beginPath()
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2)
        ctx.fillStyle = star.color
        ctx.globalAlpha = Math.abs(Math.sin(star.opacity))
        ctx.fill()
      })
      ctx.globalAlpha = 1
      animId = requestAnimationFrame(draw)
    }

    draw()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  )
}

export default StarField