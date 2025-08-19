export default function SectionTitle({children, right}:{children:React.ReactNode,right?:React.ReactNode}){
  return (
    <div className="flex items-baseline justify-between px-4">
      <h2 className="text-lg font-semibold">{children}</h2>
      {right}
    </div>
  )
}
