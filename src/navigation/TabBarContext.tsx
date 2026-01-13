import React, {createContext, useContext, useState, ReactNode} from "react";

type TabBarContextType = {
  visible: boolean;
  showTabBar: () => void;
  hideTabBar: () => void;
};

const TabBarContext = createContext<TabBarContextType>({
  visible: true,
  showTabBar: () => {},
  hideTabBar: () => {},
});

export const TabBarProvider = ({children}: {children: ReactNode}) => {
  const [visible, setVisible] = useState(true);

  const showTabBar = () => setVisible(true);
  const hideTabBar = () => setVisible(false);

  return <TabBarContext.Provider value={{visible, showTabBar, hideTabBar}}>{children}</TabBarContext.Provider>;
};

export const useTabBar = () => useContext(TabBarContext);
