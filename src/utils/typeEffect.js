export const typeTextEffect = (fullText, setMessages, setLoading, speed = 15) => {
  let index = 0;

  const interval = setInterval(() => {
    index++;

    setMessages(prev => {
      const updated = [...prev];
      updated[updated.length - 1] = {
        role: 'ai',
        text: fullText.slice(0, index)
      };
      return updated;
    });

    if (index >= fullText.length) {
      clearInterval(interval);
      setLoading(false); 
    }
  }, speed);
};
