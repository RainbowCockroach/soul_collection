import React from "react";
import "./BBCodeDisplay.css";

// Interface for the BBCodeDisplay component props
interface BBCodeDisplayProps {
  // The BBCode string to be parsed and displayed
  bbcode: string;
}

// BBCodeDisplay component that renders BBCode as HTML
// Based on the GitHub BBCode Live Editor reference implementation
const BBCodeDisplay: React.FC<BBCodeDisplayProps> = ({ bbcode }) => {
  // Comprehensive BBCode parser function that converts BBCode tags to HTML
  const parseBBCode = (text: string): string => {
    // Replace BBCode tags with their HTML equivalents
    return (
      text
        // Bold text: [b]text[/b] -> <strong>text</strong>
        .replace(/\[b\](.*?)\[\/b\]/gi, "<strong>$1</strong>")
        // Italic text: [i]text[/i] -> <em>text</em>
        .replace(/\[i\](.*?)\[\/i\]/gi, "<em>$1</em>")
        // Underlined text: [u]text[/u] -> <u>text</u>
        .replace(/\[u\](.*?)\[\/u\]/gi, "<u>$1</u>")
        // Strikethrough text: [s]text[/s] -> <s>text</s>
        .replace(/\[s\](.*?)\[\/s\]/gi, "<s>$1</s>")
        // Quote: [quote]text[/quote] -> <blockquote>text</blockquote>
        .replace(/\[quote\](.*?)\[\/quote\]/gi, "<blockquote>$1</blockquote>")
        // Code: [code]text[/code] -> <code>text</code>
        .replace(/\[code\](.*?)\[\/code\]/gi, "<code>$1</code>")
        // URLs with custom text: [url=link]text[/url] -> <a href="link">text</a>
        .replace(
          /\[url=(.*?)\](.*?)\[\/url\]/gi,
          '<a href="$1" target="_blank" rel="noopener noreferrer">$2</a>'
        )
        // URLs: [url]link[/url] -> <a href="link">link</a>
        .replace(
          /\[url\](.*?)\[\/url\]/gi,
          '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
        )
        // Images: [img]url[/img] -> <img src="url" alt="image">
        .replace(/\[img\](.*?)\[\/img\]/gi, '<img src="$1" alt="image" />')
        // Color: [color=red]text[/color] -> <span style="color: red">text</span>
        .replace(
          /\[color=(.*?)\](.*?)\[\/color\]/gi,
          '<span style="color: $1">$2</span>'
        )
        // Size: [size=12]text[/size] -> <span style="font-size: 12px">text</span>
        .replace(
          /\[size=(\d+)\](.*?)\[\/size\]/gi,
          '<span style="font-size: $1px">$2</span>'
        )
        // Font: [font=Arial]text[/font] -> <span style="font-family: Arial">text</span>
        .replace(
          /\[font=(.*?)\](.*?)\[\/font\]/gi,
          '<span style="font-family: $1">$2</span>'
        )
        // Align center: [align=center]text[/align] -> <div style="text-align: center">text</div>
        .replace(
          /\[align=(.*?)\](.*?)\[\/align\]/gi,
          '<div style="text-align: $1">$2</div>'
        )
        // Horizontal rule: [hr] -> <hr>
        .replace(/\[hr\]/gi, "<hr>")
        // Lists: [list]...[/list] -> <ul>...</ul>
        .replace(/\[list\](.*?)\[\/list\]/gi, "<ul>$1</ul>")
        // List items: [*]text -> <li>text</li>
        .replace(/\[\*\](.*?)(?=\[\*\]|\[\/list\]|$)/gi, "<li>$1</li>")
        // Tables: [table]...[/table] -> <table>...</table>
        .replace(/\[table\](.*?)\[\/table\]/gi, "<table>$1</table>")
        // Table rows: [tr]...[/tr] -> <tr>...</tr>
        .replace(/\[tr\](.*?)\[\/tr\]/gi, "<tr>$1</tr>")
        // Table cells: [td]...[/td] -> <td>...</td>
        .replace(/\[td\](.*?)\[\/td\]/gi, "<td>$1</td>")
        // Line breaks: [br] -> <br>
        .replace(/\[br\]/gi, "<br>")
        // Convert newlines to line breaks
        .replace(/\n/g, "<br>")
    );
  };

  // Parse the BBCode text to HTML
  const htmlContent = parseBBCode(bbcode);

  return (
    <div
      className={`bbcode-display`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

export default BBCodeDisplay;
