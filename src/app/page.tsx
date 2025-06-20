export default function Home() {
  // Generate an array of 4 unique image URLs with random query parameters to prevent caching
  const imageUrls = Array.from({ length: 4 }, (_, i) => `https://picsum.photos/300/200?random=${i + 1}`);

  return (
    <div className="container mx-auto flex flex-grow flex-col items-center justify-center gap-8">
      <h1 className="text-4xl font-bold">Welcome to Agent Hunt</h1>
      {/* Row of random images */}
      <div className="flex flex-wrap justify-center gap-4">
        {imageUrls.map((url, index) => (
          <img
            key={index}
            src={url}
            alt={`Random image ${index + 1}`}
            className="h-[200px] w-[300px] rounded-lg object-cover"
          />
        ))}
      </div>
    </div>
  );
}
