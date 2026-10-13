import { memo, useMemo, useRef, type ReactNode } from "react";
import {
  Animated,
  PanResponder,
  Vibration,
  View,
  StyleSheet,
} from "react-native";
import { Icon } from "@/components/common/Icon";
import { useTheme } from "@/store/theme/hook";

const THRESHOLD = 72; // 触发阈值（dp）
const MAX_PULL = 104; // 最大拉伸距离（dp）

interface Props {
  children: ReactNode;
  onTrigger: () => void;
  width: number;
  height: number;
}

/**
 * 右划触发回调的行容器：
 * - 只响应“明显横向”的右划，不影响纵向滚动与点击
 * - 过阈值震动一次，松手时触发 onTrigger，并弹回原位
 */
export default memo(({ children, onTrigger, width, height }: Props) => {
  const theme = useTheme();
  const translateX = useRef(new Animated.Value(0)).current;
  const passedRef = useRef(false);
  const onTriggerRef = useRef(onTrigger);
  onTriggerRef.current = onTrigger;

  const panResponder = useMemo(() => {
    const reset = () => {
      passedRef.current = false;
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 6,
      }).start();
    };
    return PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        g.dx > 10 && g.dx > Math.abs(g.dy) * 2,
      onPanResponderMove: (_, g) => {
        const dx = Math.max(0, g.dx);
        // 过阈值后加阻尼
        const x = dx > THRESHOLD ? THRESHOLD + (dx - THRESHOLD) * 0.3 : dx;
        translateX.setValue(Math.min(x, MAX_PULL));
        const passed = dx >= THRESHOLD;
        if (passed !== passedRef.current) {
          passedRef.current = passed;
          if (passed) Vibration.vibrate(12);
        }
      },
      onPanResponderRelease: () => {
        if (passedRef.current) onTriggerRef.current();
        reset();
      },
      onPanResponderTerminate: reset,
      onPanResponderTerminationRequest: () => false,
    });
  }, [translateX]);

  const iconOpacity = translateX.interpolate({
    inputRange: [0, THRESHOLD * 0.4, THRESHOLD],
    outputRange: [0, 0.35, 1],
    extrapolate: "clamp",
  });
  const iconScale = translateX.interpolate({
    inputRange: [0, THRESHOLD, MAX_PULL],
    outputRange: [0.6, 1, 1.25],
    extrapolate: "clamp",
  });

  return (
    <View style={{ width, height, overflow: "hidden" }}>
      <View
        style={[
          StyleSheet.absoluteFill,
          styles.bg,
          { backgroundColor: theme["c-primary-background-hover"] },
        ]}
      >
        <Animated.View
          style={{ opacity: iconOpacity, transform: [{ scale: iconScale }] }}
        >
          <Icon name="add-music" size={20} color={theme["c-primary-font"]} />
        </Animated.View>
      </View>
      <Animated.View
        style={{ width, height, transform: [{ translateX }] }}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  bg: {
    justifyContent: "center",
    paddingLeft: 28,
  },
});
