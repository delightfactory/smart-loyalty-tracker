
export interface TableInfo {
  name: string;
  description: string;
  hasRelationships: boolean;
  hasPrimaryKey: boolean;
  primaryKeyColumn?: string;
}

export interface DatabaseInfo {
  tables: TableInfo[];
  relationships: {
    source: string;
    target: string;
    sourceColumn: string;
    targetColumn: string;
  }[];
  totalTables: number;
  totalRelationships: number;
}
