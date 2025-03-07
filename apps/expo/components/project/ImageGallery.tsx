import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
  FlatList,
  Animated,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { OptimizedImage } from '@/lib/utils/imageModule';
import { Text } from '@/components/ui/text';
import { X, ChevronLeft, ChevronRight, Trash2, ImageIcon } from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { deleteImage, getStorageUrl } from '@/lib/utils/imageModule';
import safelyGetImageUrl from '@/utils/safelyGetImageKey';

// Get screen dimensions for responsive sizing
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Type for inference objects
interface Inference {
  id: number;
  imageKey: string | null;
  publicId: string;
  roomId?: number | null;
  createdAt?: string;
  imageId?: number | null;
  isDeleted?: boolean;
  projectId?: number;
}

interface ImageGalleryProps {
  inferences: Inference[];
  urlMap: {
    [imageKey: string]: string;
  };
  onRefresh?: () => Promise<void>;
  roomName?: string;
  selectable?: boolean;
  onSelectionChange?: (selectedKeys: string[]) => void;
  initialSelectedKeys?: string[];
  onDelete?: (imageKey: string) => Promise<void>;
}

export default function ImageGallery({
  inferences,
  urlMap,
  onRefresh,
  roomName,
  selectable = false,
  onSelectionChange,
  initialSelectedKeys = [],
  onDelete,
}: ImageGalleryProps) {
  // State for modal visibility and active image
  const [modalVisible, setModalVisible] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedKeys, setSelectedKeys] = useState<string[]>(initialSelectedKeys);
  
  // Refs for scrolling
  const modalScrollRef = useRef<FlatList>(null);
  const thumbnailScrollRef = useRef<ScrollView>(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // Calculate grid layout
  const itemsPerRow = 3;
  
  // Filter out inferences without imageKey or with undefined urlMap entries
  const validInferences = inferences
    .filter((inference): inference is Inference & { imageKey: string } => 
      !!inference.imageKey && typeof inference.imageKey === 'string' && !inference.isDeleted && !inference.Image?.isDeleted
    );
  

  // Organize inferences into rows for grid display
  const rows = Array.from({ length: Math.ceil(validInferences.length / itemsPerRow) }).map(
    (_, rowIndex) => {
      const startIndex = rowIndex * itemsPerRow;
      const rowItems = validInferences.slice(startIndex, startIndex + itemsPerRow);
      // Pad the row with null values if needed to maintain 3 columns
      const paddedItems: (typeof validInferences[0] | null)[] = [...rowItems];
      while (paddedItems.length < itemsPerRow) {
        paddedItems.push(null);
      }
      return paddedItems;
    }
  );
  
  // Handle image press to open modal
  const handleImagePress = (index: number) => {
    setActiveImageIndex(index);
    setModalVisible(true);
    
    // Animate fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };
  
  // Handle modal close
  const handleCloseModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
    });
  };
  
  // Navigate to previous image in modal
  const goToPreviousImage = () => {
    if (activeImageIndex > 0) {
      const newIndex = activeImageIndex - 1;
      setActiveImageIndex(newIndex);
      modalScrollRef.current?.scrollToIndex({ index: newIndex, animated: true });
    }
  };
  
  // Navigate to next image in modal
  const goToNextImage = () => {
    if (activeImageIndex < validInferences.length - 1) {
      const newIndex = activeImageIndex + 1;
      setActiveImageIndex(newIndex);
      modalScrollRef.current?.scrollToIndex({ index: newIndex, animated: true });
    }
  };
  
  // Handle image selection toggle
  const toggleImageSelection = (imageKey: string) => {
    let newSelectedKeys: string[];
    
    if (selectedKeys.includes(imageKey)) {
      newSelectedKeys = selectedKeys.filter(key => key !== imageKey);
    } else {
      newSelectedKeys = [...selectedKeys, imageKey];
    }
    
    setSelectedKeys(newSelectedKeys);
    if (onSelectionChange) {
      onSelectionChange(newSelectedKeys);
    }
  };
  
  // Handle image deletion
  const handleDeleteImage = async (imageKey: string,publicId:string) => {
            console.log("🚀 ~ handleDeleteImage ~ validInferences:",JSON.stringify(validInferences,null,2))

    if (onDelete) {
      
       await onDelete(
        publicId
       );
       handleCloseModal();
       return
    }
    if (onRefresh) {
      await deleteImage(imageKey, { onRefresh });
      
      // If the deleted image was the active one, close the modal
      if (modalVisible && validInferences[activeImageIndex]?.imageKey === imageKey) {
        handleCloseModal();
      }
    }
  };
  
  // Render image item in the grid
  const renderGridItem = (inference: Inference | null, index: number) => {
    if (!inference || !inference.imageKey) {
      return <View key={`empty-${index}`} style={styles.galleryItem} />;
    }
    
    const { imageKey } = inference;
    
    // Try to get the URL from the map first, then fall back to direct construction
    let imageUrl = safelyGetImageUrl(urlMap, imageKey, '');
    
    // If URL is still empty, try to construct it directly
    if (!imageUrl) {
      imageUrl = getStorageUrl(imageKey);
    }
    
    const isSelected = selectedKeys.includes(imageKey);
    
    return (
      <View key={imageKey} style={styles.galleryItem}>
        <OptimizedImage
          uri={imageUrl}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
          onPress={selectable 
            ? () => toggleImageSelection(imageKey) 
            : () => {
                // Find the index in validInferences array
                const validIndex = validInferences.findIndex(item => item.id === inference.id);
                if (validIndex >= 0) {
                  handleImagePress(validIndex);
                }
              }
          }
          isSelected={isSelected}
          imageKey={imageKey}
        />
      </View>
    );
  };
  
  // Render image in the modal
  const renderModalItem = ({ item }: { item: Inference & { imageKey: string }; index: number }) => {
    // Try to get the URL from the map first, then fall back to direct construction
    let imageUrl = safelyGetImageUrl(urlMap, item.imageKey, '');
    
    // If URL is still empty, try to construct it directly
    if (!imageUrl) {
      imageUrl = getStorageUrl(item.imageKey);
    }
    
    return (
      <View style={styles.modalImageContainer}>
        <OptimizedImage
          uri={imageUrl}
          style={styles.modalImage}
          resizeMode="contain"
          imageKey={item.imageKey}
          showInfo={true}
          showDeleteButton={true}
          onDelete={() => {
            console.log("🚀 ~ renderModalItem ~ item:",JSON.stringify(item,null,2))
            handleDeleteImage(item.imageKey,item.Image?.publicId || '')}}
          onRefresh={onRefresh}
        />
      </View>
    );
  };
  
  // Handle scroll end in modal
  const handleScrollEnd = (e: any) => {
    const contentOffset = e.nativeEvent.contentOffset;
    const index = Math.round(contentOffset.x / SCREEN_WIDTH);
    setActiveImageIndex(index);
  };

  // If there are no valid images, show an empty state
  if (validInferences.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <ImageIcon size={40} color="#9CA3AF" />
        <Text style={styles.emptyText}>No images available</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {/* Grid Gallery */}
      <View style={styles.galleryGrid}>
        {rows.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.galleryRow}>
            {row.map((inference, colIndex) => 
              renderGridItem(inference, rowIndex * itemsPerRow + colIndex)
            )}
          </View>
        ))}
      </View>
      
      {/* Full Screen Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={handleCloseModal}
      >
        <Animated.View style={[styles.modalContainer, { opacity: fadeAnim }]}>
          <SafeAreaView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
                <X size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{roomName || 'Image Gallery'}</Text>
              <View style={{ width: 40 }} />
            </View>
            
            <FlatList
              ref={modalScrollRef}
              data={validInferences}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              initialScrollIndex={activeImageIndex}
              getItemLayout={(_, index) => ({
                length: SCREEN_WIDTH,
                offset: SCREEN_WIDTH * index,
                index,
              })}
              renderItem={renderModalItem}
              keyExtractor={(item) => item.imageKey}
              onMomentumScrollEnd={handleScrollEnd}
            />
            
            <View style={styles.navigationContainer}>
              <TouchableOpacity 
                onPress={goToPreviousImage} 
                style={[styles.navButton, activeImageIndex === 0 && styles.navButtonDisabled]}
                disabled={activeImageIndex === 0}
              >
                <ChevronLeft size={30} color={activeImageIndex === 0 ? "#666" : "#fff"} />
              </TouchableOpacity>
              
              <Text style={styles.pageIndicator}>
                {activeImageIndex + 1} / {validInferences.length}
              </Text>
              
              <TouchableOpacity 
                onPress={goToNextImage} 
                style={[styles.navButton, activeImageIndex === validInferences.length - 1 && styles.navButtonDisabled]}
                disabled={activeImageIndex === validInferences.length - 1}
              >
                <ChevronRight size={30} color={activeImageIndex === validInferences.length - 1 ? "#666" : "#fff"} />
              </TouchableOpacity>
            </View>
            
            {/* Thumbnails */}
            <View style={styles.thumbnailContainer}>
              <ScrollView
                ref={thumbnailScrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.thumbnailScroll}
                scrollEventThrottle={16}
                bounces={false}
                decelerationRate="fast"
                snapToInterval={70}
                snapToAlignment="start"
              >
                {validInferences.map((inference, index) => {
                  let imageUrl = safelyGetImageUrl(urlMap, inference.imageKey, '');
                  
                  if (!imageUrl) {
                    imageUrl = getStorageUrl(inference.imageKey);
                  }
                  
                  return (
                    <TouchableOpacity
                      key={inference.imageKey}
                      activeOpacity={0.7}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      onPress={() => {
                        const newIndex = index;
                        setActiveImageIndex(newIndex);
                        modalScrollRef.current?.scrollToIndex({ 
                          index: newIndex, 
                          animated: true,
                          viewPosition: 0.5
                        });
                        thumbnailScrollRef.current?.scrollTo({
                          x: newIndex * 70,
                          animated: true
                        });
                      }}
                      style={[
                        styles.thumbnail,
                        index === activeImageIndex && styles.activeThumbnail,
                      ]}
                    >
                      <OptimizedImage
                        uri={imageUrl}
                        style={styles.thumbnailImage}
                        size="small"
                        imageKey={inference.imageKey}
                        disabled={true}
                      />
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </SafeAreaView>
        </Animated.View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  galleryGrid: {
    padding: 8,
  },
  galleryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  galleryItem: {
    width: (SCREEN_WIDTH - 40) / 3,
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f1f5f9',
    marginHorizontal: 2,
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  modalContent: {
    flex: 1,
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  modalImageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT - 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT - 200,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  navButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(30, 64, 175, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  pageIndicator: {
    color: '#fff',
    fontSize: 16,
  },
  thumbnailContainer: {
    height: 80,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  thumbnailScroll: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  thumbnail: {
    width: 60,
    height: 60,
    marginHorizontal: 5,
    borderRadius: 4,
    overflow: 'hidden',
  },
  activeThumbnail: {
    borderWidth: 2,
    borderColor: '#1e40af',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
}); 