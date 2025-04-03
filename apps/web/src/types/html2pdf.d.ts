declare function html2pdf(): {
  set: (options: {
    margin?: number;
    filename?: string;
    html2canvas?: {
      scale?: number;
    };
    pagebreak?: {
      mode?: string[];
    };
  }) => {
    from: (element: HTMLElement | null) => {
      save: () => Promise<void>;
    };
  };
}; 