import {View, Image, Text, StyleSheet} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";

interface Props {
  mapRotate?: number;
}

const Compass = ({mapRotate = 0}: Props) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.compass,
        {
          top: insets.top + 16,
        },
      ]}>
      <Image source={require("@/assets/images/home/compass-bg.png")} style={styles.compassBg} resizeMode="stretch" />
      <View style={styles.directionWrapper}>
        <View style={[styles.diamond, {transform: [{rotate: `${mapRotate}deg`}]}]}>
          <Image source={require("@/assets/images/home/icon-compass.png")} style={styles.diamondImg} />
        </View>
        <Text style={[styles.direction, styles.north]}>北</Text>
        <Text style={[styles.direction, styles.east]}>东</Text>
        <Text style={[styles.direction, styles.south]}>南</Text>
        <Text style={[styles.direction, styles.west]}>西</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  compass: {
    position: "absolute",
    right: 16,
    zIndex: 1999,
    width: 73.5,
    height: 72.5,
    alignItems: "center",
    justifyContent: "center",
  },

  compassBg: {
    width: 73.5,
    height: 72.5,
  },

  directionWrapper: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 36,
    backgroundColor: "#2d2d22",
    borderRadius: 36,
  },

  diamond: {
    width: 12,
    height: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  diamondImg: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },

  direction: {
    position: "absolute",
    zIndex: 2000,
    width: 29,
    height: 29,
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
    // 文本描边（白色描边效果）
    textShadowColor: "#fff",
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 1,
  },

  north: {
    top: -28,
    left: "50%",
    marginLeft: -14.5,
    color: "#ff4242",
    textAlign: "center",
  },

  east: {
    top: -8,
    right: -22,
    transform: [{translateX: 14}, {translateY: 14}],
  },

  south: {
    bottom: -32,
    left: "50%",
    marginLeft: -14.5,
    textAlign: "center",
  },

  west: {
    top: -8,
    left: -10,
    transform: [{translateX: -14}, {translateY: 14}],
  },
});

export default Compass;
