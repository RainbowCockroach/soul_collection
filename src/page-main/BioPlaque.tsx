import "../page-intro/ChatBubble.css";
import "./BioPlaque.css";

interface Props {
  text: string;
  speaker?: string;
  avatar?: string;
}

const BioPlaque: React.FC<Props> = ({ text, speaker, avatar }) => {
  return (
    <div className="chat-bubble-container bio-plaque-container">
      <div className="chat-bubble bio-plaque">
        {speaker && (
          <div className="chat-bubble-header">
            {avatar && (
              <div className="chat-bubble-avatar">
                <img src={avatar} alt={speaker} />
              </div>
            )}
            <div className="chat-bubble-speaker">{speaker}</div>
          </div>
        )}

        <div className="chat-bubble-content bio-plaque-content">
          <div className="chat-bubble-text">{text}</div>
        </div>
      </div>
    </div>
  );
};

export default BioPlaque;
