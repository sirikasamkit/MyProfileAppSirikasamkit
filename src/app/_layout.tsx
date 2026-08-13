import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AppProvider } from '@/context/AppContext';

SplashScreen.preventAutoHideAsync();

// หน้าต่างหลักของแอปที่จะคลุมทุกอย่างเอาไว้ (เหมือนกรอบรูปภาพ)
export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    // จัดการสีของแอป (มืด/สว่าง) ตามเครื่องลูกค้า
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {/* เอา Context (โดราเอมอน) มาห่อแอปไว้ หน้าไหนก็ดึงของไปใช้ได้ */}
      <AppProvider>
        {/* หน้าจอโหลดเข้าแอปแบบเท่ๆ มีรูปอนิเมชัน */}
        <AnimatedSplashOverlay />
        {/* ตรงนี้แหละคือหน้าแอปจริงๆ ที่เราเขียนไปใส่ */}
        <Slot />
      </AppProvider>
    </ThemeProvider>
  );
}
