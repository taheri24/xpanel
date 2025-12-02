USE [TR-EDOCS]
GO

/****** Object:  Table [dbo].[PUR_INVD]    Script Date: 11/30/2025 9:45:36 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[PUR_INVD](
	[belgeno] [nchar](16) NOT NULL,
	[siraNo] [nchar](10) NOT NULL,
	[saticiUrunKodu] [nchar](20) NULL,
	[urunAdi] [nchar](200) NULL,
	[markaAdi] [nchar](200) NULL,
	[modelAdi] [nchar](200) NULL,
	[tanim] [nchar](200) NULL,
	[birimKodu] [nchar](200) NULL,
	[birimFiyat] [money] NULL,
	[miktar] [money] NULL,
	[malHizmetMiktari] [money] NULL,
	[toplamVergiTutari] [money] NULL,
 CONSTRAINT [PK_PUR_INVD] PRIMARY KEY CLUSTERED 
(
	[belgeno] ASC,
	[siraNo] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO


