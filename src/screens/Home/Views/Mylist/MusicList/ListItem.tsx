import { memo, useRef } from "react";
import { View, TouchableOpacity } from "react-native";
import { LIST_ITEM_HEIGHT } from "@/config/constant";
// import { BorderWidths } from '@/theme'
import { Icon } from "@/components/common/Icon";
import { createStyle, type RowInfo } from "@/utils/tools";
import { useTheme } from "@/store/theme/hook";
import { useAssertApiSupport } from "@/store/common/hook";
import { scaleSizeH } from "@/utils/pixelRatio";
import Text from "@/components/common/Text";
import SwipeToQueue from "@/components/common/SwipeToQueue";

export const ITEM_HEIGHT = scaleSizeH(LIST_ITEM_HEIGHT);

export default memo(
  ({
    item,
    index,
    activeIndex,
    onPress,
    onShowMenu,
    onLongPress,
    onSwipeQueue,
    selectedList,
    rowInfo,
    isShowAlbumName,
    isShowInterval,
  }: {
    item: LX.Music.MusicInfo;
    index: number;
    activeIndex: number;
    onPress: (item: LX.Music.MusicInfo, index: number) => void;
    onLongPress: (item: LX.Music.MusicInfo, index: number) => void;
    onShowMenu: (
      item: LX.Music.MusicInfo,
      index: number,
      position: { x: number; y: number; w: number; h: number },
    ) => void;
    onSwipeQueue: (item: LX.Music.MusicInfo) => void;
    selectedList: LX.Music.MusicInfo[];
    rowInfo: RowInfo;
    isShowAlbumName: boolean;
    isShowInterval: boolean;
  }) => {
    const theme = useTheme();

    const isSelected = selectedList.includes(item);
    // console.log(item.name, selectedList, selectedList.includes(item))
    const isSupported = useAssertApiSupport(item.source);
    const moreButtonRef = useRef<TouchableOpacity>(null);
    const handleShowMenu = () => {
      if (moreButtonRef.current?.measure) {
        moreButtonRef.current.measure((fx, fy, width, height, px, py) => {
          // console.log(fx, fy, width, height, px, py)
          onShowMenu(item, index, {
            x: Math.ceil(px),
            y: Math.ceil(py),
            w: Math.ceil(width),
            h: Math.ceil(height),
          });
        });
      }
    };
    const active = activeIndex == index;

    const singer = `${item.singer}${isShowAlbumName && item.meta.albumName ? ` · ${item.meta.albumName}` : ""}`;

    return (
      <SwipeToQueue
        width={rowInfo.rowWidth}
        height={ITEM_HEIGHT}
        onTrigger={() => {
          onSwipeQueue(item);
        }}
      >
        <View
          style={{
            ...styles.listItem,
            width: rowInfo.rowWidth,
            height: ITEM_HEIGHT,
            backgroundColor: isSelected
              ? theme["c-primary-background-hover"]
              : "rgba(0,0,0,0)",
            opacity: isSupported ? 1 : 0.5,
          }}
        >
          {active ? (
            <View
              style={[
                styles.activeBar,
                { backgroundColor: theme["c-primary-font"] },
              ]}
            />
          ) : null}
          <TouchableOpacity
            style={styles.listItemLeft}
            onPress={() => {
              onPress(item, index);
            }}
            onLongPress={() => {
              onLongPress(item, index);
            }}
          >
            <View style={styles.itemInfo}>
              <Text
                size={16}
                color={active ? theme["c-primary-font"] : theme["c-font"]}
                numberOfLines={1}
              >
                {item.name}
              </Text>
              <Text
                style={styles.singer}
                size={12}
                color={active ? theme["c-primary-alpha-200"] : theme["c-500"]}
                numberOfLines={1}
              >
                {singer}
              </Text>
            </View>
            {isShowInterval ? (
              <Text
                size={12}
                color={active ? theme["c-primary-alpha-400"] : theme["c-250"]}
                numberOfLines={1}
              >
                {item.interval}
              </Text>
            ) : null}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleShowMenu}
            ref={moreButtonRef}
            style={styles.moreButton}
          >
            <Icon
              name="dots-vertical"
              style={{ color: theme["c-350"] }}
              size={12}
            />
          </TouchableOpacity>
        </View>
      </SwipeToQueue>
    );
  },
  (prevProps, nextProps) => {
    return !!(
      prevProps.item === nextProps.item &&
      prevProps.index === nextProps.index &&
      prevProps.isShowAlbumName === nextProps.isShowAlbumName &&
      prevProps.isShowInterval === nextProps.isShowInterval &&
      prevProps.activeIndex != nextProps.index &&
      nextProps.activeIndex != nextProps.index &&
      nextProps.selectedList.includes(nextProps.item) ==
        prevProps.selectedList.includes(nextProps.item)
    );
  },
);

const styles = createStyle({
  listItem: {
    flexDirection: "row",
    flexWrap: "nowrap",
    paddingLeft: 20,
    paddingRight: 4,
    alignItems: "center",
  },
  activeBar: {
    position: "absolute",
    left: 8,
    top: "28%",
    bottom: "28%",
    width: 3,
    borderRadius: 2,
  },
  listItemLeft: {
    flex: 1,
    flexGrow: 1,
    flexShrink: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  itemInfo: {
    flexGrow: 1,
    flexShrink: 1,
    paddingRight: 8,
  },
  singer: {
    paddingTop: 4,
    fontWeight: "300",
  },
  moreButton: {
    height: "80%",
    paddingLeft: 16,
    paddingRight: 16,
    justifyContent: "center",
  },
});
