import { StyleProp, TextStyle, ViewStyle } from "react-native";

declare module "react-native-mapbox-places-autocomplete" {
  export interface PlaceSuggestion {
    place_name: string;
    [key: string]: any;
  }

  export interface PlacesAutocomplete {
    value: string;
    suggestions: PlaceSuggestion[];
    setValue: (value: string) => void;
    setSuggestions: (suggestions: PlaceSuggestion[]) => void;
    [key: string]: any;
  }

  export interface MapboxPlacesAutocompleteProps {
    id?: string;
    inputStyle?: StyleProp<TextStyle>;
    containerStyle?: StyleProp<ViewStyle>;
    inputClassName?: string;
    containerClassName?: string;
    placeholder?: string;
    accessToken?: string;
    onPlaceSelect?: (place: PlaceSuggestion) => void;
    countryId?: string;
    onClearInput?: (data: { id: string }) => void;
  }

  declare const MapboxPlacesAutocomplete: React.FC<MapboxPlacesAutocompleteProps>;

  export default MapboxPlacesAutocomplete;
}
