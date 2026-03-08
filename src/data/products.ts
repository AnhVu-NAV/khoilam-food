export interface Product {
  id: string;
  name: string;
  description: string;
  ingredients: string;
  storage: string;
  usage: string;
  category: string;
  weights: string[];
  image: string;
  price: number;
  stock?: number;
}

export const products: Product[] = [
  {
    id: 'trau-gac-bep',
    name: 'Thịt Trâu Gác Bếp',
    description: 'Trâu bản thả đồi, tẩm ướp Mắc khén, Hạt dổi, ớt rừng. Hun khói củi nhãn liên tục nhiều giờ để đượm mùi khói nhưng vẫn giữ độ ngọt mềm bên trong.',
    ingredients: 'Thịt trâu bản, Mắc khén, Hạt dổi, ớt rừng, gia vị Tây Bắc.',
    storage: 'Ngăn mát tủ lạnh: 5 - 7 ngày. Ngăn đá (cấp đông): 3 - 6 tháng (khuyên dùng).',
    usage: 'Hấp cách thủy hoặc quay lò vi sóng (1-2 phút) cho thịt mềm và dậy hương. Đập dập nhẹ, xé sợi dọc thớ, chấm cùng Chẩm chéo Khói Lam.',
    category: 'Thịt gác bếp',
    weights: ['250g', '500g', '1kg'],
    image: 'https://picsum.photos/seed/trau/800/800',
    price: 250000
  },
  {
    id: 'lon-ban-gac-bep',
    name: 'Thịt Lợn Bản Gác Bếp',
    description: 'Lợn đen vùng cao (phần thăn/mông), ướp gia vị thảo mộc núi rừng theo công thức cổ truyền. Sấy chậm trên gác bếp để thớ thịt săn lại, màu nâu óng tự nhiên.',
    ingredients: 'Thịt lợn đen vùng cao, thảo mộc núi rừng.',
    storage: 'Ngăn mát: 7 - 10 ngày. Ngăn đá: 3 - 6 tháng.',
    usage: 'Ăn liền trực tiếp hoặc làm nóng nhẹ (quay vi sóng 30s). Xé tơi chấm cùng tương ớt Mường Khương hoặc Chẩm chéo.',
    category: 'Thịt gác bếp',
    weights: ['250g', '500g', '1kg'],
    image: 'https://picsum.photos/seed/lon/800/800',
    price: 200000
  },
  {
    id: 'ba-chi-heo-gac-bep',
    name: 'Ba Chỉ Heo Gác Bếp',
    description: 'Ba chỉ heo tươi (tỷ lệ nạc mỡ cân đối), tẩm ướp 12 loại gia vị Tây Bắc. Hun khói kỹ để lớp mỡ trong veo, giòn sần sật, vị đậm đà không ngấy.',
    ingredients: 'Ba chỉ heo tươi, 12 loại gia vị Tây Bắc.',
    storage: 'Bắt buộc bảo quản ngăn đá tủ lạnh (để được 6 tháng).',
    usage: 'Rã đông, thái lát mỏng vừa ăn. Ngon nhất khi chiên áp chảo cháy cạnh, hoặc xào cùng tỏi, măng rừng, cải mèo.',
    category: 'Thịt gác bếp',
    weights: ['500g', '1kg'],
    image: 'https://picsum.photos/seed/bachi/800/800',
    price: 180000
  },
  {
    id: 'bap-heo-gac-bep',
    name: 'Bắp Heo Gác Bếp',
    description: 'Thịt bắp heo tươi tuyển chọn, tẩm ướp mắc khén, hạt dổi và gia vị bí truyền. Hun chậm bằng khói củi tự nhiên giúp thịt săn chắc, thơm nồng, đậm đà.',
    ingredients: 'Thịt bắp heo tươi, mắc khén, hạt dổi, gia vị bí truyền.',
    storage: 'Ngăn mát tủ lạnh: 5 - 7 ngày. Ngăn đá (cấp đông): 3 - 6 tháng (khuyên dùng).',
    usage: 'Hấp cách thủy hoặc quay lò vi sóng (1-2 phút). Xé nhỏ theo thớ thịt, ngon nhất khi chấm cùng tương ớt hoặc Chẩm chéo Khói Lam.',
    category: 'Thịt gác bếp',
    weights: ['250g', '500g', '1kg'],
    image: 'https://picsum.photos/seed/bapheo/800/800',
    price: 190000
  },
  {
    id: 'lap-xuong-gac-bep',
    name: 'Lạp Xưởng Gác Bếp (Lạp sườn)',
    description: 'Thịt nạc vai và mỡ phần hạt lựu, tẩm rượu men lá và gia vị. Nhồi ruột non thủ công, phơi nắng nhẹ rồi hun khói bã mía cho vỏ giòn, màu đỏ hồng.',
    ingredients: 'Thịt nạc vai, mỡ phần, rượu men lá, gia vị, ruột non.',
    storage: 'Ngăn mát: 1 tháng. Ngăn đá: 6 tháng.',
    usage: 'Chiên bằng nước (đổ sâm sấp nước đun cạn rồi lăn cho xém vỏ) hoặc nướng than hoa/nồi chiên không dầu. Thái lát ăn kèm xôi hoặc cơm nóng.',
    category: 'Lạp xưởng',
    weights: ['500g', '1kg'],
    image: 'https://picsum.photos/seed/lapxuong/800/800',
    price: 150000
  },
  {
    id: 'lap-xuong-hun-mia',
    name: 'Lạp Xưởng Hun Mía',
    description: 'Thịt heo sạch hòa quyện cùng rượu Mai quế lộ. Đặc biệt được hun bằng khói bã mía khô, tạo màu đỏ hồng tự nhiên và hương thơm ngọt thanh độc đáo.',
    ingredients: 'Thịt heo sạch, rượu Mai quế lộ, gia vị.',
    storage: 'Ngăn mát tủ lạnh: 1 tháng. Ngăn đá (cấp đông): 3 tháng (khuyên dùng).',
    usage: 'Rửa qua nước ấm, đem chiên nước (chiên với chút nước cho đến khi cạn và vàng đều), nướng hoặc hấp. Thái lát mỏng ăn cùng xôi hoặc cơm nóng.',
    category: 'Lạp xưởng',
    weights: ['500g', '1kg'],
    image: 'https://picsum.photos/seed/lapxuongmia/800/800',
    price: 160000
  },
  {
    id: 'lap-xuong-trung-muoi',
    name: 'Lạp Xưởng Trứng Muối',
    description: 'Thịt heo tươi kết hợp nhân trứng muối bùi ngậy. Quy trình chế biến thủ công giữ trọn độ tươi, không chất bảo quản, tạo nên sự giao thoa ẩm thực mới lạ.',
    ingredients: 'Thịt heo tươi, trứng muối, gia vị.',
    storage: 'Ngăn mát tủ lạnh: 15 - 20 ngày. Ngăn đá (cấp đông): 4 - 5 tháng (khuyên dùng).',
    usage: 'Chiên, nướng hoặc hấp cách thủy. Lưu ý chiên lửa nhỏ để trứng muối bên trong không bị khô, giữ độ béo ngậy đặc trưng.',
    category: 'Lạp xưởng',
    weights: ['500g', '1kg'],
    image: 'https://picsum.photos/seed/lapxuongtrung/800/800',
    price: 180000
  },
  {
    id: 'ca-tram-den-gac-bep',
    name: 'Cá Trắm Đen Gác Bếp',
    description: 'Cá trắm đen chắc thịt, lọc xương, tẩm ướp gừng, sả và các loại lá thơm đặc trưng. Sấy trên gác bếp theo phương pháp truyền thống cho đến khi cá khô se, vị ngọt thanh tự nhiên.',
    ingredients: 'Cá trắm đen, gừng, sả, lá thơm.',
    storage: 'Ngăn mát tủ lạnh: 3 - 5 ngày. Ngăn đá (cấp đông): 3 - 4 tháng (khuyên dùng).',
    usage: 'Nướng sơ trên than hồng hoặc dùng nồi chiên không dầu (180°C trong 3-5 phút) để dậy mùi thơm. Ăn trực tiếp như món nhắm hoặc dùng với cơm.',
    category: 'Cá gác bếp',
    weights: ['500g', '1kg'],
    image: 'https://picsum.photos/seed/catram/800/800',
    price: 220000
  },
  {
    id: 'gia-vi-cham-cheo',
    name: 'Gia Vị Chẩm Chéo',
    description: 'Gia vị chấm đặc trưng của người Thái vùng Tây Bắc, kết hợp từ mắc khén, hạt dổi, ớt, tỏi, gừng và các loại rau thơm.',
    ingredients: 'Mắc khén, hạt dổi, ớt, tỏi, gừng, rau thơm.',
    storage: 'Nơi khô ráo, thoáng mát.',
    usage: 'Dùng làm nước chấm cho các món thịt gác bếp, thịt luộc, rau củ luộc.',
    category: 'Gia vị',
    weights: ['50g', '100g'],
    image: 'https://picsum.photos/seed/chamcheo/800/800',
    price: 35000
  },
  {
    id: 'tuong-ot-muong-khuong',
    name: 'Tương Ớt Mường Khương',
    description: 'Đặc sản tương ớt cay nồng từ Mường Khương, Lào Cai. Được làm từ ớt thóc bản địa, tỏi, hạt dổi, hạt thì là, thảo quả.',
    ingredients: 'Ớt thóc, tỏi, hạt dổi, hạt thì là, thảo quả, muối, rượu.',
    storage: 'Nơi khô ráo, thoáng mát. Tránh ánh nắng trực tiếp. Đậy kín sau khi sử dụng.',
    usage: 'Dùng làm nước chấm cho các món thịt gác bếp, bún, phở, hoặc làm gia vị tẩm ướp.',
    category: 'Gia vị',
    weights: ['250ml', '500ml'],
    image: 'https://picsum.photos/seed/tuongot/800/800',
    price: 45000
  }
];
