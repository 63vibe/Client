'use client';

import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Plus, X, TrendingUp, Search, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Keyword } from '@/src/types/keyword';
import { getKeywordsByEmployeeId, createKeyword, deleteKeyword, getKeywordCount } from '@/src/lib/keywords';
import { getUserFromStorage } from '@/src/lib/auth';
import { toast } from 'sonner';

const suggestedKeywords = [
  '프로젝트', '스프린트', 'DevOps', '클라우드', 'DB', 
  '채용', '복지', '교육', 'UX', '디자인'
];

export function KeywordManager() {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // 키워드 목록 로드
  useEffect(() => {
    loadKeywords();
  }, []);

  const loadKeywords = async () => {
    try {
      setIsLoading(true);
      const user = getUserFromStorage();
      if (!user) {
        toast.error('로그인이 필요합니다');
        return;
      }

      const data = await getKeywordsByEmployeeId(user.employee_id);
      setKeywords(data);
    } catch (error) {
      console.error('키워드 로드 오류:', error);
      toast.error('키워드를 불러오는 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddKeyword = async () => {
    if (!newKeyword.trim()) {
      toast.error('키워드를 입력해주세요');
      return;
    }

    const user = getUserFromStorage();
    if (!user) {
      toast.error('로그인이 필요합니다');
      return;
    }

    // 최대 20개 제한 확인
    const currentCount = await getKeywordCount(user.employee_id);
    if (currentCount >= 20) {
      toast.error('최대 20개까지 등록 가능합니다');
      return;
    }

    setIsAdding(true);
    try {
      await createKeyword(user.employee_id, {
        text: newKeyword.trim(),
        category: newCategory.trim() || undefined,
      });
      toast.success('키워드가 추가되었습니다');
      setNewKeyword('');
      setNewCategory('');
      setIsDialogOpen(false);
      await loadKeywords();
    } catch (error: any) {
      console.error('키워드 추가 오류:', error);
      toast.error(error.message || '키워드 추가 중 오류가 발생했습니다');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveKeyword = async (id: string) => {
    try {
      await deleteKeyword(id);
      toast.success('키워드가 삭제되었습니다');
      await loadKeywords();
    } catch (error) {
      console.error('키워드 삭제 오류:', error);
      toast.error('키워드 삭제 중 오류가 발생했습니다');
    }
  };

  const handleAddSuggested = async (text: string) => {
    if (keywords.find(k => k.text === text)) {
      toast.error('이미 등록된 키워드입니다');
      return;
    }

    const user = getUserFromStorage();
    if (!user) {
      toast.error('로그인이 필요합니다');
      return;
    }

    // 최대 20개 제한 확인
    const currentCount = await getKeywordCount(user.employee_id);
    if (currentCount >= 20) {
      toast.error('최대 20개까지 등록 가능합니다');
      return;
    }

    setIsAdding(true);
    try {
      await createKeyword(user.employee_id, {
        text: text.trim(),
      });
      toast.success('키워드가 추가되었습니다');
      await loadKeywords();
    } catch (error: any) {
      console.error('키워드 추가 오류:', error);
      toast.error(error.message || '키워드 추가 중 오류가 발생했습니다');
    } finally {
      setIsAdding(false);
    }
  };

  const categories = Array.from(
    new Set(keywords.filter(k => k.category).map(k => k.category as string))
  );

  const filteredKeywords = keywords.filter(k => 
    k.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (k.category && k.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const isMaxKeywords = keywords.length >= 20;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

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
                <Button onClick={handleAddKeyword} disabled={isAdding}>
                  {isAdding ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      추가 중...
                    </>
                  ) : (
                    '추가'
                  )}
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
            <div className="text-sm text-green-700 mb-1">총 키워드</div>
            <div className="text-green-900">{keywords.length}개</div>
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
              disabled={keywords.some(k => k.text === keyword) || isMaxKeywords || isAdding}
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