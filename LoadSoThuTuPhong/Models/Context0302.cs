

using Microsoft.EntityFrameworkCore;

namespace LoadSoThuTuPhong.Models
{
    public class Context0302 : DbContext
    {

        public Context0302(DbContextOptions<Context0302> options) : base(options) { }
        public DbSet<ThongTinDoanhNghiep> ThongTinDoanhNghieps { get; set; }

        public DbSet<LoadSoThuTuPhongModel> LoadSoThuTuPhongModels { get; set; }
        public DbSet<HT_CaiDatSTT> HT_CaiDatSTT { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<ThongTinDoanhNghiep>().HasNoKey();
            modelBuilder.Entity<LoadSoThuTuPhongModel>().HasNoKey();
            modelBuilder.Entity<HT_CaiDatSTT>().HasNoKey();
        }

        public bool TestConnection()
        {
            try
            {
                return this.Database.CanConnect();
            }
            catch (Exception)
            {
                return false;
            }
        }


    }
}
