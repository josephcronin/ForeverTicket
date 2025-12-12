export interface TicketData {
  eventDetails: {
    artistOrEvent: string;
    venue: string;
    date: string;
    seatInfo: string;
    personalMessage: string;
  };
  visualTheme: {
    colorPalette: string[];
    textures: string[];
    typography: {
      headlineFont: string;
      bodyFont: string;
    };
    moodKeywords: string[];
    iconIdeas: string[];
  };
  aiPrompts: {
    backgroundPrompt: string;
    ticketArtPrompt: string;
  };
  giftCopy: {
    ticketTitle: string;
    tagline: string;
    emotionalDescription: string;
    giftMessage: string;
  };
  layoutGuide: {
    recommendedLayout: string;
    hierarchyNotes: string;
    fontWeights: {
      eventName: string;
      seatInfo: string;
      extras: string;
    };
  };
}

export interface GeneratedAsset {
  imageUrl: string;
  ticketData: TicketData;
}
