namespace LoadSoThuTuPhong.Models
{
    public class LoadSoThuTuPhongModel
    {
        public int? SoThuTu { get; set; }
        public string? TenBN { get; set; }
        public int? TrangThai { get; set; } // đổi từ string? sang int? cho khớp CASE SQL
    }
    public class HT_CaiDatSTT
    {
        public string Loai { get; set; }
        public int? SoDong { get; set; }
        public int ThoiGian { get; set; }
    }
}
