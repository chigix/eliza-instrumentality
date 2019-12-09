export interface UserStory {
  rawMessages: string[];
  number: number;
  links: Array<{
    userStory: UserStory,
    isDependencyOf?: number,
    hasPurposeTo?: number,
  }>;
}

export interface LabeledTerms {
  pawns: string[];
  leftPawns: string;
  aims: string[];
  knights: string[];
  rooks: string[];
  queen?: string | undefined;
  king?: string | undefined;
}
