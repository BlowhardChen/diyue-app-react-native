import {useFocusEffect} from "@react-navigation/native";
import {StatusBar} from "react-native";
import {useCallback} from "react";

export const useStatusBar = (barStyle: "light-content" | "dark-content", backgroundColor: string) => {
  useFocusEffect(
    useCallback(() => {
      console.log("MyScreen focused");
      StatusBar.setBarStyle(barStyle, true);
      StatusBar.setBackgroundColor(backgroundColor, true);
    }, [barStyle, backgroundColor]),
  );
};
