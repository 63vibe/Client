'use client';

import { useMemo, useState } from 'react';
import { calculatePrice } from '@/src/lib/pricingEngine';
import type { Material, OrderDraft, PricingInput, ProcessOption } from '@/src/types/inventory';

const PRODUCTS = [
  { code: 'FILM_STD', name: '필름 표준형' },
  { code: 'FILM_PREMIUM', name: '필름 프리미엄형' },
];

function toCsv(orders: OrderDraft[]): string {
  const header = [
    'createdAt',
    'customerName',
    'productCode',
    'material',
    'widthMm',
    'lengthM',
    'options',
    'qty',
    'unitPrice',
    'lineAmount',
    'ruleVersion',
    'customerMemo',
  ];
  const rows = orders.map((order) => [
    order.createdAt,
    order.customerName,
    order.productCode,
    order.material,
    order.widthMm,
    order.lengthM,
    order.processOptions.join('+'),
    order.quantity,
    order.pricing.unitPrice,
    order.pricing.lineAmount,
    order.pricing.version,
    order.customerMemo ?? '',
  ]);

  return [header, ...rows]
    .map((cols) => cols.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))
    .join('\n');
}

export default function InventoryMvpPage() {
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [customerName, setCustomerName] = useState('다모아유통 샘플');
  const [customerMemo, setCustomerMemo] = useState('치마폭 900 기준 재협의 요청');
  const [productCode, setProductCode] = useState('FILM_STD');
  const [material, setMaterial] = useState<Material>('PET');
  const [widthMm, setWidthMm] = useState(900);
  const [lengthM, setLengthM] = useState(50);
  const [quantity, setQuantity] = useState(120);
  const [options, setOptions] = useState<ProcessOption[]>(['LAM']);
  const [orders, setOrders] = useState<OrderDraft[]>([]);

  const pricingInput: PricingInput = {
    productCode,
    quantity,
    widthMm,
    lengthM,
    material,
    processOptions: options,
    asOfDate: new Date().toISOString().slice(0, 10),
  };

  const preview = useMemo(() => calculatePrice(pricingInput), [pricingInput]);

  const toggleOption = (option: ProcessOption) => {
    setOptions((prev) => (prev.includes(option) ? prev.filter((v) => v !== option) : [...prev, option]));
  };

  const addOrder = () => {
    const pricing = calculatePrice(pricingInput);
    const next: OrderDraft = {
      ...pricingInput,
      pricing,
      customerName,
      customerMemo,
      createdAt: new Date().toISOString(),
    };
    setOrders((prev) => [next, ...prev]);
  };

  const downloadReport = () => {
    const csv = toCsv(orders);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'orders_report.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleLogin = () => {
    if (loginId === 'abcd' && loginPassword === 'abcd!!') {
      setIsAuthenticated(true);
      setLoginError('');
      return;
    }

    setLoginError('아이디 또는 비밀번호가 올바르지 않습니다.');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setLoginId('');
    setLoginPassword('');
  };

  if (!isAuthenticated) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md items-center px-6 py-10">
        <section className="w-full space-y-4 rounded-lg border p-6">
          <h1 className="text-2xl font-bold">필름 유통 MVP 로그인</h1>
          <p className="text-sm text-gray-600">데모 계정으로 로그인해 수주/단가 계산 화면을 확인하세요.</p>

          <div className="space-y-2">
            <label className="text-sm font-medium">아이디</label>
            <input
              className="w-full rounded border p-2"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              placeholder="아이디 입력"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">비밀번호</label>
            <input
              className="w-full rounded border p-2"
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="비밀번호 입력"
            />
          </div>

          {loginError ? <p className="text-sm text-red-600">{loginError}</p> : null}

          <button className="w-full rounded bg-blue-600 px-4 py-2 text-white" onClick={handleLogin}>
            로그인
          </button>

          <p className="text-xs text-gray-500">데모 계정: abcd / abcd!!</p>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">필름 유통 재고/수주 MVP 데모</h1>
        <button className="rounded border px-3 py-1 text-sm" onClick={handleLogout}>
          로그아웃
        </button>
      </div>
      <p className="text-sm text-gray-600">
        단가 계산(룰 버전 기반) → 수주 등록 → 거래처 수주현황 CSV 출력까지 동작하는 이모부 데모 버전입니다.
      </p>

      <section className="grid gap-4 rounded-lg border p-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">거래처명</label>
          <input className="w-full rounded border p-2" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">거래처 메모</label>
          <input className="w-full rounded border p-2" value={customerMemo} onChange={(e) => setCustomerMemo(e.target.value)} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">제품</label>
          <select className="w-full rounded border p-2" value={productCode} onChange={(e) => setProductCode(e.target.value)}>
            {PRODUCTS.map((product) => (
              <option key={product.code} value={product.code}>
                {product.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">소재</label>
          <select className="w-full rounded border p-2" value={material} onChange={(e) => setMaterial(e.target.value as Material)}>
            <option value="PET">PET</option>
            <option value="PP">PP</option>
            <option value="PE">PE</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">치마폭(mm)</label>
          <input className="w-full rounded border p-2" type="number" value={widthMm} onChange={(e) => setWidthMm(Number(e.target.value))} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">길이(m)</label>
          <input className="w-full rounded border p-2" type="number" value={lengthM} onChange={(e) => setLengthM(Number(e.target.value))} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">수량</label>
          <input className="w-full rounded border p-2" type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">가공 옵션</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-1 text-sm">
              <input type="checkbox" checked={options.includes('LAM')} onChange={() => toggleOption('LAM')} /> 라미네이팅
            </label>
            <label className="flex items-center gap-1 text-sm">
              <input type="checkbox" checked={options.includes('CUT')} onChange={() => toggleOption('CUT')} /> 컷팅
            </label>
          </div>
        </div>

        <div className="flex items-end">
          <button className="rounded bg-blue-600 px-4 py-2 text-white" onClick={addOrder}>
            수주 추가
          </button>
        </div>
      </section>

      <section className="rounded-lg border p-4">
        <h2 className="mb-3 text-xl font-semibold">단가 계산 미리보기</h2>
        <div className="grid gap-2 text-sm md:grid-cols-3">
          <p>단가: <strong>{preview.unitPrice.toLocaleString()}원</strong></p>
          <p>금액: <strong>{preview.lineAmount.toLocaleString()}원</strong></p>
          <p>룰 버전: <strong>{preview.version}</strong></p>
          <p>기본단가: {preview.breakdown.base.toLocaleString()}</p>
          <p>폭 계수: {preview.breakdown.widthFactor}</p>
          <p>가공비: {preview.breakdown.processFee.toLocaleString()}</p>
          <p>마진율: {(preview.breakdown.marginRate * 100).toFixed(1)}%</p>
          <p>반올림 전: {preview.breakdown.finalBeforeRounding.toFixed(1)}</p>
          <p>반올림 규칙: {preview.breakdown.roundingUnit}원 단위</p>
        </div>
      </section>

      <section className="rounded-lg border p-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xl font-semibold">수주 현황</h2>
          <button className="rounded border px-3 py-1 text-sm" onClick={downloadReport} disabled={orders.length === 0}>
            CSV 다운로드(엑셀 열기 가능)
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="border p-2">일시</th>
                <th className="border p-2">거래처</th>
                <th className="border p-2">제품</th>
                <th className="border p-2">옵션</th>
                <th className="border p-2">수량</th>
                <th className="border p-2">단가</th>
                <th className="border p-2">금액</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, idx) => (
                <tr key={`${order.createdAt}-${idx}`}>
                  <td className="border p-2">{order.createdAt.slice(0, 16).replace('T', ' ')}</td>
                  <td className="border p-2">{order.customerName}</td>
                  <td className="border p-2">{order.productCode}</td>
                  <td className="border p-2">{order.processOptions.join('+') || '-'}</td>
                  <td className="border p-2 text-right">{order.quantity.toLocaleString()}</td>
                  <td className="border p-2 text-right">{order.pricing.unitPrice.toLocaleString()}</td>
                  <td className="border p-2 text-right">{order.pricing.lineAmount.toLocaleString()}</td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td className="border p-3 text-center text-gray-500" colSpan={7}>
                    아직 등록된 수주가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
