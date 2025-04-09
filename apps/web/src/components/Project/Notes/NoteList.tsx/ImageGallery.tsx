import { useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent } from "@components/ui/dialog";
import { Button } from "@components/ui/button";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const SUPABASE_IMAGE_URL = "https://zmvdimcemmhesgabixlf.supabase.co/storage/v1/object/public/note-images";

interface ImageGalleryProps {
  images: Array<{ imageKey: string }>;
}

const ImageGallery = ({ images }: ImageGalleryProps) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  if (!images || images.length === 0) return null;

  return (
    <div className="mt-4">
      {/* Image Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
        {images.map((image, index) => (
          <div
            key={image.imageKey}
            className="relative aspect-square cursor-pointer overflow-hidden rounded-lg group"
            onClick={() => setSelectedImageIndex(index)}
          >
            <Image
              src={
                image.imageKey.startsWith("http")
                  ? image.imageKey
                  : `${SUPABASE_IMAGE_URL}/${image.imageKey}`
              }
              alt="Note image"
              fill
              className="object-cover transition-transform duration-200 group-hover:scale-105"
              sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 20vw"
            />
          </div>
        ))}
      </div>

      {/* Image Modal */}
      <Dialog open={selectedImageIndex !== null} onOpenChange={() => setSelectedImageIndex(null)}>
        <DialogContent className="max-w-4xl p-0 bg-black/80 backdrop-blur-sm">
          {selectedImageIndex !== null && (
            <div className="relative">
              <div className="relative aspect-video w-full">
                <Image
                  src={
                    images[selectedImageIndex].imageKey.startsWith("http")
                      ? images[selectedImageIndex].imageKey
                      : `${SUPABASE_IMAGE_URL}/${images[selectedImageIndex].imageKey}`
                  }
                  alt="Note image"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 80vw"
                />
              </div>

              {/* Navigation Buttons */}
              <div className="absolute inset-0 flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 rounded-full bg-black/70 hover:bg-black/90 text-white"
                  onClick={() => setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : (prev || 0) - 1))}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 rounded-full bg-black/70 hover:bg-black/90 text-white"
                  onClick={() => setSelectedImageIndex((prev) => ((prev || 0) + 1) % images.length)}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </div>

              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 h-8 w-8 rounded-full bg-black/70 hover:bg-black/90 text-white"
                onClick={() => setSelectedImageIndex(null)}
              >
                <X className="h-4 w-4" />
              </Button>

              {/* Image Counter */}
              <div className="absolute bottom-2 left-2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                {selectedImageIndex + 1} / {images.length}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImageGallery; 