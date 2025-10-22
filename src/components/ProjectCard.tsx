import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { motion } from "framer-motion";

interface ProductCardProps {
  image: string;
  name: string;
  description: string;
  onView: () => void;
}

export default function ProductCard({ image, name, description, onView }: ProductCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden border border-gray-200 pt-0 shadow-sm hover:shadow-md transition-all duration-300">
        <CardHeader className="p-0">
          <img
            src={image}
            alt={name}
            className="w-full h-48 object-cover rounded-t-lg pt-0 mt-0"
          />
        </CardHeader>
        <CardContent className="p-4 space-y-2">
          <CardTitle className="text-lg font-semibold text-gray-900">
            {name}
          </CardTitle>
          <p className="text-gray-600 text-sm line-clamp-2">
            {description}
          </p>
        </CardContent>
        <CardFooter className="px-4 pb-4">
          <Button
            size={"default"}
            variant="default"
            onClick={onView}
            className="w-full bg-main-color text-white hover:bg-white hover:text-main-color 
            hover:border hover:border-main-color transition-all duration-300 cursor-pointer"
          >
            عرض  تفاصيل الروبوت
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
