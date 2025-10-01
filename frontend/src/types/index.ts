export interface Secret {
  name: string;
  displayName: string;
  createTime: string;
  latestVersion?: string;
  versionCount?: number;
  labels?: { [key: string]: string };
}

export interface SecretVersion {
  version: string;
  state: string;
  createTime: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
}