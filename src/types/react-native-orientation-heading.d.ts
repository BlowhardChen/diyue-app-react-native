declare module "react-native-orientation-heading" {
  export default class Heading {
    static start(updateRate: number): Promise<boolean>;
    static stop(): void;
    static on(callback: (heading: number) => void): void;
  }
}
