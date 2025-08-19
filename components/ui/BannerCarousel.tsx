'use client'
export default function BannerCarousel({images}:{images:string[]}) {
  return (
    <div className="px-4">
      <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2">
        {images.map((src,i)=>(
          <img key={i} src={src} alt="" className="snap-center shrink-0 w-[92%] h-40 object-cover rounded-2xl card" />
        ))}
      </div>
      <div className="flex justify-center gap-2 mt-1">
        {images.map((_,i)=><span key={i} className="size-1.5 rounded-full bg-gray-300 inline-block" />)}
      </div>
    </div>
  )
}
