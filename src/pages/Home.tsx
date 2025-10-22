// src/pages/Home.tsx
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProjectCard";

export default function Home() {
  const products = [
    {
      id: 1,
      name: "روبوت 1",
      description: " هذا الروبوت الذكي مصمم خصيصًا لتنظيف الخلايا الشمسية بكفاءة عالية دون الحاجة إلى تدخل بشري.يعمل بتقنيات حديثة تضمن إزالة الأتربة والغبار بشكل آمن وسريع، مما يحافظ على كفاءة إنتاج الطاقة ويطيل عمر الألواح الشمسية.يتميز بخفة وزنه وسهولة تركيبه، ويعمل بشكل تلقائي لتوفير الوقت والجهد مع استهلاك طاقة منخفض.حل مبتكر يضمن نظافة دائمة وأداءً مثاليًا لمنظومتك الشمسية.",
      image: "public/images/Robot 1.jpeg",
    },
    {
      id: 2,
      name: "  روبوت 2",
      description: " هذا الروبوت الذكي مصمم خصيصًا لتنظيف الخلايا الشمسية بكفاءة عالية دون الحاجة إلى تدخل بشري.يعمل بتقنيات حديثة تضمن إزالة الأتربة والغبار بشكل آمن وسريع، مما يحافظ على كفاءة إنتاج الطاقة ويطيل عمر الألواح الشمسية.يتميز بخفة وزنه وسهولة تركيبه، ويعمل بشكل تلقائي لتوفير الوقت والجهد مع استهلاك طاقة منخفض.حل مبتكر يضمن نظافة دائمة وأداءً مثاليًا لمنظومتك الشمسية.",
      image: "public/images/Robot 1.jpeg",
    },
    {
      id: 3,
      name: " روبوت 3",
      description: " هذا الروبوت الذكي مصمم خصيصًا لتنظيف الخلايا الشمسية بكفاءة عالية دون الحاجة إلى تدخل بشري.يعمل بتقنيات حديثة تضمن إزالة الأتربة والغبار بشكل آمن وسريع، مما يحافظ على كفاءة إنتاج الطاقة ويطيل عمر الألواح الشمسية.يتميز بخفة وزنه وسهولة تركيبه، ويعمل بشكل تلقائي لتوفير الوقت والجهد مع استهلاك طاقة منخفض.حل مبتكر يضمن نظافة دائمة وأداءً مثاليًا لمنظومتك الشمسية.",
      image: "public/images/Robot 1.jpeg",
    },
  ];

  const handleViewProduct = (id: number) => {
    console.log("View product:", id);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto px-6 pt-28 pb-10">
        <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">
          الروبوتات الخاصة بمشروعك
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              image={product.image}
              name={product.name}
              description={product.description}
              onView={() => handleViewProduct(product.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
