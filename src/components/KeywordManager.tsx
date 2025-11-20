'use client';

import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Plus, X, TrendingUp, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';

interface Keyword {
  id: string;
  text: string;
  matchCount: number;
  addedDate: string;
  category?: string;
}

const mockKeywords: Keyword[] = [
  { id: '1', text: '워크샵', matchCount: 12, addedDate: '2024-11-01', category: '행사' },
  { id: '2', text: 'AI', matchCount: 28, addedDate: '2024-11-01', category: '기술' },
  { id: '3', text: '보안', matchCount: 15, addedDate: '2024-11-05', category: '인프라' },
  { id: '4', text: '운영', matchCount: 34, addedDate: '2024-11-05', category: '인프라' },
  { id: '5', text: '개발', matchCount: 45, addedDate: '2024-11-01', category: '기술' },
  { id: '6', text: 'React', matchCount: 8, addedDate: '2024-11-10', category: '기술' },
  { id: '7', text: '마케팅', matchCount: 6, addedDate: '2024-11-12', category: '비즈니스' },
];

const suggestedKeywords = [
  '프로젝트', '스프린트', 'DevOps', '클라우드', 'DB', 
  '채용', '복지', '교육', 'UX', '디자인'
];

export function KeywordManager() {
  const [keywords, setKeywords] = useState<Keyword[]>(mockKeywords);
  const [newKeyword, setNewKeyword] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddKeyword = () => {
    if (newKeyword.trim()) {
      if (keywords.length >= 20) {
        // 최대 20개 제한
        return;
      }
      const keyword: Keyword = {
        id: Date.now().toString(),
        text: newKeyword.trim(),
        matchCount: 0,
        addedDate: new Date().toISOString().split('T')[0],
        category: newCategory || undefined
      };
      setKeywords([...keywords, keyword]);
      setNewKeyword('');
      setNewCategory('');
      setIsDialogOpen(false);
    }
  };

  const handleRemoveKeyword = (id: string) => {
    setKeywords(keywords.filter(k => k.id !== id));
  };

  const handleAddSuggested = (text: string) => {
    if (!keywords.find(k => k.text === text)) {
      if (keywords.length >= 20) {
        // 최대 20개 제한
        return;
      }
      const keyword: Keyword = {
        id: Date.now().toString(),
        text,
        matchCount: 0,
        addedDate: new Date().toISOString().split('T')[0]
      };
      setKeywords([...keywords, keyword]);
    }
  };

  const categories = Array.from(new Set(keywords.filter(k => k.category).map(k => k.category)));

  const filteredKeywords = keywords.filter(k => 
    k.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (k.category && k.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const isMaxKeywords = keywords.length >= 20;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-gray-900 mb-2">키워드 관리</h2>
            <p className="text-gray-600">
              관심있는 키워드를 등록하고 관련 게시글을 자동으로 필터링합니다
            </p>
            <p className="text-sm text-orange-600 mt-1">
              * 최대 20개까지 등록 가능합니다 (현재 {keywords.length}/20)
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={isMaxKeywords}>
                <Plus className="w-4 h-4 mr-2" />
                키워드 추가
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>새 키워드 추가</DialogTitle>
                <DialogDescription>
                  관심있는 키워드를 입력하세요
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="keyword-text">키워드</Label>
                  <Input
                    id="keyword-text"
                    placeholder="예: 프로젝트"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword()}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="keyword-category">카테고리 (선택)</Label>
                  <Input
                    id="keyword-category"
                    placeholder="예: 기술"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  취소
                </Button>
                <Button onClick={handleAddKeyword}>
                  추가
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="text-sm text-blue-700 mb-1">등록된 키워드</div>
            <div className="text-blue-900">{keywords.length}개</div>
          </Card>
          <Card className="p-4 bg-green-50 border-green-200">
            <div className="text-sm text-green-700 mb-1">총 매칭</div>
            <div className="text-green-900">{keywords.reduce((sum, k) => sum + k.matchCount, 0)}건</div>
          </Card>
          <Card className="p-4 bg-purple-50 border-purple-200">
            <div className="text-sm text-purple-700 mb-1">카테고리</div>
            <div className="text-purple-900">{categories.length}개</div>
          </Card>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="키워드 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-gray-600" />
          <h3 className="text-gray-900">추천 키워드</h3>
        </div>
        <p className="text-gray-600 text-sm mb-4">
          많이 사용되는 키워드를 추가해보세요
        </p>
        <div className="flex flex-wrap gap-2">
          {suggestedKeywords.map(keyword => (
            <Button
              key={keyword}
              variant="outline"
              size="sm"
              onClick={() => handleAddSuggested(keyword)}
              disabled={keywords.some(k => k.text === keyword) || isMaxKeywords}
            >
              <Plus className="w-3 h-3 mr-1" />
              {keyword}
            </Button>
          ))}
        </div>
      </Card>

      <div className="space-y-4">
        {categories.length > 0 ? (
          categories.map(category => {
            const categoryKeywords = filteredKeywords.filter(k => k.category === category);
            if (categoryKeywords.length === 0) return null;
            
            return (
              <Card key={category} className="p-6">
                <h3 className="text-gray-900 mb-4">{category}</h3>
                <div className="flex flex-wrap gap-2">
                  {categoryKeywords.map(keyword => (
                    <Badge
                      key={keyword.id}
                      variant="secondary"
                      className="pl-3 pr-2 py-2 text-sm flex items-center gap-2"
                    >
                      <span>{keyword.text}</span>
                      <span className="text-xs text-gray-500">({keyword.matchCount})</span>
                      <button
                        onClick={() => handleRemoveKeyword(keyword.id)}
                        className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </Card>
            );
          })
        ) : null}

        {filteredKeywords.filter(k => !k.category).length > 0 && (
          <Card className="p-6">
            <h3 className="text-gray-900 mb-4">미분류</h3>
            <div className="flex flex-wrap gap-2">
              {filteredKeywords.filter(k => !k.category).map(keyword => (
                <Badge
                  key={keyword.id}
                  variant="secondary"
                  className="pl-3 pr-2 py-2 text-sm flex items-center gap-2"
                >
                  <span>{keyword.text}</span>
                  <span className="text-xs text-gray-500">({keyword.matchCount})</span>
                  <button
                    onClick={() => handleRemoveKeyword(keyword.id)}
                    className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </Card>
        )}

        {filteredKeywords.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-gray-500">검색 결과가 없습니다.</p>
          </Card>
        )}
      </div>
    </div>
  );
}