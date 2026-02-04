export default function FeatureCard({ title, description, icon }) {
  return (
    <div className="bg-[#1b1330] rounded-xl p-6 flex flex-col justify-between hover:bg-[#251a46] transition">
      <div className="h-[15rem]">
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className="text-2xl text-gray-300">{description}</p>
      </div>
      <div className="mt-4 flex justify-end text-pink-400 text-3xl">
        {icon}
      </div>
    </div>
  );
}
