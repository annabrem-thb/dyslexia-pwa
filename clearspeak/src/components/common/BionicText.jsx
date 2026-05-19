import React from 'react';

const BionicText = ({ text, enabled }) => {
  if (!enabled || typeof text !== 'string') return <>{text}</>;

  return (
    <>
      {text.split(' ').map((word, idx) => {
        // Regex filters out characters that shouldn't count towards bolding length
        const cleanWord = word.replace(
          /[^a-zA-Z0-9ąćęłńóśźżĄĆĘŁŃÓŚŹŻäöüßÄÖÜ:.]/g,
          '',
        );
        if (cleanWord.length === 0) return <span key={idx}>{word} </span>;

        // Calculate split point: roughly half for long words, more for short ones
        let boldLen =
          cleanWord.length > 3
            ? Math.ceil(cleanWord.length / 2)
            : Math.max(1, cleanWord.length - 1);

        let actualSplit = 0;
        let letterCount = 0;
        for (let i = 0; i < word.length; i++) {
          if (/[a-zA-Z0-9ąćęłńóśźżĄĆĘŁŃÓŚŹŻäöüßÄÖÜ:.]/.test(word[i]))
            letterCount++;
          actualSplit++;
          if (letterCount === boldLen) break;
        }

        return (
          <span key={idx}>
            <b className="font-black opacity-100">
              {word.substring(0, actualSplit)}
            </b>
            <span className="opacity-80">
              {word.substring(actualSplit)}
            </span>{' '}
          </span>
        );
      })}
    </>
  );
};

export default BionicText;
