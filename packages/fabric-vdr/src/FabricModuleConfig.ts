export interface FabricNetworkConfig {
  network: string;
  baseUrl: string;
  token?: string;
}

export interface FabricModuleConfigOptions {
  networks: FabricNetworkConfig[];
}

export class FabricModuleConfig {
  private readonly options: FabricModuleConfigOptions;

  public constructor(options: FabricModuleConfigOptions) {
    this.options = options;
  }

  /**
   * Returns the list of configured Fabric networks.
   */
  public get networks(): FabricNetworkConfig[] {
    return this.options.networks;
  }
}
