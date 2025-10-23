import { Button } from "./ui/button";

export default function RobotCard({ image, name, description, onView }) {
  return (
    <div
      onClick={onView} 
      className="group bg-white border border-gray-100 shadow-md rounded-2xl 
      overflow-hidden hover:shadow-xl hover:-translate-y-1 
      transition-all duration-500 flex flex-col cursor-pointer"
    >
      {/* img */}
      <div className="relative overflow-hidden">
        <img
          src={image}
          alt={name}
          className="h-56 w-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        <div
          className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent 
          opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        ></div>
      </div>

      {/* content */}
      <div className="p-6 flex flex-col justify-between grow">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-main-color transition-colors duration-300">
            {name}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-4">
            {description}
          </p>
        </div>

        <Button
          onClick={(e) => { 
            e.stopPropagation(); // prevent card click
            onView(); 
          }}
          className="mt-6 bg-main-color text-white border border-main-color 
          hover:bg-white hover:text-main-color 
          hover:shadow-md transition-all duration-300 rounded-full"
        >
          View Details
        </Button>
      </div>
    </div>
  );
}
