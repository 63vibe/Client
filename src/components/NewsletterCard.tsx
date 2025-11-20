import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Eye, ExternalLink, Clock, User, Sparkles } from 'lucide-react';
import { Card } from './ui/card';

interface Post {
  id: string;
  board: string;
  title: string;
  summary: string;
  keywords: string[];
  author: string;
  date: string;
  views: number;
  isNew: boolean;
  matchedKeywords: string[];
  source?: string; // 'board' or 'naver'
}

interface NewsletterCardProps {
  post: Post;
  index: number;
}

export function NewsletterCard({ post, index }: NewsletterCardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date('2024-11-18');
    const diffTime = Math.abs(today.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '오늘';
    if (diffDays === 1) return '어제';
    if (diffDays < 7) return `${diffDays}일 전`;
    return dateStr;
  };

  return (
    <Card className={`p-6 hover:shadow-md transition-shadow ${post.matchedKeywords.length > 0 ? 'border-blue-300 bg-blue-50/30' : ''}`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
          {index + 1}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3 mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge variant="secondary" className="text-xs">
                  {post.board}
                </Badge>
                {post.isNew && (
                  <Badge variant="default" className="text-xs bg-red-500 hover:bg-red-600">
                    NEW
                  </Badge>
                )}
                {post.matchedKeywords.length > 0 && (
                  <Badge variant="default" className="text-xs bg-blue-600 hover:bg-blue-700 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    관심 키워드
                  </Badge>
                )}
              </div>
              
              <h3 className="text-gray-900 mb-2 hover:text-blue-600 cursor-pointer">
                {post.title}
              </h3>
              
              <p className="text-gray-600 mb-3 leading-relaxed">
                {post.summary}
              </p>

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {post.author}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatDate(post.date)}
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {post.views}
                </div>
              </div>

              {post.matchedKeywords.length > 0 && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-blue-700">매칭된 키워드:</span>
                    {post.matchedKeywords.map(keyword => (
                      <Badge key={keyword} variant="outline" className="text-xs border-blue-300 text-blue-700">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-3 flex items-center gap-2 flex-wrap">
                {post.keywords.map(keyword => (
                  <Badge key={keyword} variant="outline" className="text-xs">
                    #{keyword}
                  </Badge>
                ))}
              </div>
            </div>

            <Button variant="ghost" size="sm" className="flex-shrink-0">
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}