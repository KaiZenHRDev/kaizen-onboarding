using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace OnBoarding.Migrations
{
    /// <inheritdoc />
    public partial class InitialDatabaseSetup : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Companies",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    company_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    company_name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    company_details = table.Column<string>(type: "text", nullable: true),
                    colour_code = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    logo_path = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Companies", x => x.Id);
                    table.UniqueConstraint("AK_Companies_company_id", x => x.company_id);
                });

            migrationBuilder.CreateTable(
                name: "HrAdapterData",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CandidateId = table.Column<string>(type: "text", nullable: false),
                    CompanyId = table.Column<string>(type: "text", nullable: false),
                    FormDataJson = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HrAdapterData", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CandidateId = table.Column<string>(type: "text", nullable: true),
                    CompanyId = table.Column<string>(type: "text", nullable: true),
                    Email = table.Column<string>(type: "text", nullable: false),
                    IcNumber = table.Column<string>(type: "text", nullable: true),
                    PasswordHash = table.Column<string>(type: "text", nullable: false),
                    Role = table.Column<string>(type: "text", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsFirstLogin = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "branch_code",
                columns: table => new
                {
                    brhloccode = table.Column<string>(type: "text", nullable: false),
                    brhlocname = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    company_id = table.Column<string>(type: "character varying(50)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_branch_code", x => x.brhloccode);
                    table.ForeignKey(
                        name: "FK_branch_code_Companies_company_id",
                        column: x => x.company_id,
                        principalTable: "Companies",
                        principalColumn: "company_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "cessation_reasons",
                columns: table => new
                {
                    rsgnrsncode = table.Column<string>(type: "text", nullable: false),
                    rsgnrsndesc = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    company_id = table.Column<string>(type: "character varying(50)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_cessation_reasons", x => x.rsgnrsncode);
                    table.ForeignKey(
                        name: "FK_cessation_reasons_Companies_company_id",
                        column: x => x.company_id,
                        principalTable: "Companies",
                        principalColumn: "company_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "company_code",
                columns: table => new
                {
                    compnycode = table.Column<string>(type: "text", nullable: false),
                    compnyname = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    company_id = table.Column<string>(type: "character varying(50)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_company_code", x => x.compnycode);
                    table.ForeignKey(
                        name: "FK_company_code_Companies_company_id",
                        column: x => x.company_id,
                        principalTable: "Companies",
                        principalColumn: "company_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "country_origin_codes",
                columns: table => new
                {
                    ctyorgcode = table.Column<string>(type: "text", nullable: false),
                    ctyorgname = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    company_id = table.Column<string>(type: "character varying(50)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_country_origin_codes", x => x.ctyorgcode);
                    table.ForeignKey(
                        name: "FK_country_origin_codes_Companies_company_id",
                        column: x => x.company_id,
                        principalTable: "Companies",
                        principalColumn: "company_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "department_code",
                columns: table => new
                {
                    departcode = table.Column<string>(type: "text", nullable: false),
                    departname = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    company_id = table.Column<string>(type: "character varying(50)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_department_code", x => x.departcode);
                    table.ForeignKey(
                        name: "FK_department_code_Companies_company_id",
                        column: x => x.company_id,
                        principalTable: "Companies",
                        principalColumn: "company_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "division_code",
                columns: table => new
                {
                    divisncode = table.Column<string>(type: "text", nullable: false),
                    divisnname = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    company_id = table.Column<string>(type: "character varying(50)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_division_code", x => x.divisncode);
                    table.ForeignKey(
                        name: "FK_division_code_Companies_company_id",
                        column: x => x.company_id,
                        principalTable: "Companies",
                        principalColumn: "company_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "empty_code",
                columns: table => new
                {
                    emptypcode = table.Column<string>(type: "text", nullable: false),
                    emptypname = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    company_id = table.Column<string>(type: "character varying(50)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_empty_code", x => x.emptypcode);
                    table.ForeignKey(
                        name: "FK_empty_code_Companies_company_id",
                        column: x => x.company_id,
                        principalTable: "Companies",
                        principalColumn: "company_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "epf_code",
                columns: table => new
                {
                    epfcode = table.Column<string>(type: "text", nullable: false),
                    descrip = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    company_id = table.Column<string>(type: "character varying(50)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_epf_code", x => x.epfcode);
                    table.ForeignKey(
                        name: "FK_epf_code_Companies_company_id",
                        column: x => x.company_id,
                        principalTable: "Companies",
                        principalColumn: "company_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "field_area_codes",
                columns: table => new
                {
                    fldareaid = table.Column<string>(type: "text", nullable: false),
                    fldareaname = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    company_id = table.Column<string>(type: "character varying(50)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_field_area_codes", x => x.fldareaid);
                    table.ForeignKey(
                        name: "FK_field_area_codes_Companies_company_id",
                        column: x => x.company_id,
                        principalTable: "Companies",
                        principalColumn: "company_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "gl1_code",
                columns: table => new
                {
                    glseg1code = table.Column<string>(type: "text", nullable: false),
                    glseg1name = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    company_id = table.Column<string>(type: "character varying(50)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_gl1_code", x => x.glseg1code);
                    table.ForeignKey(
                        name: "FK_gl1_code_Companies_company_id",
                        column: x => x.company_id,
                        principalTable: "Companies",
                        principalColumn: "company_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "gl2_code",
                columns: table => new
                {
                    glseg2code = table.Column<string>(type: "text", nullable: false),
                    glseg2name = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    company_id = table.Column<string>(type: "character varying(50)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_gl2_code", x => x.glseg2code);
                    table.ForeignKey(
                        name: "FK_gl2_code_Companies_company_id",
                        column: x => x.company_id,
                        principalTable: "Companies",
                        principalColumn: "company_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "hobby_codes",
                columns: table => new
                {
                    hbycode = table.Column<string>(type: "text", nullable: false),
                    hbyname = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    company_id = table.Column<string>(type: "character varying(50)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_hobby_codes", x => x.hbycode);
                    table.ForeignKey(
                        name: "FK_hobby_codes_Companies_company_id",
                        column: x => x.company_id,
                        principalTable: "Companies",
                        principalColumn: "company_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "industry_codes",
                columns: table => new
                {
                    indstrycode = table.Column<string>(type: "text", nullable: false),
                    indstryname = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    company_id = table.Column<string>(type: "character varying(50)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_industry_codes", x => x.indstrycode);
                    table.ForeignKey(
                        name: "FK_industry_codes_Companies_company_id",
                        column: x => x.company_id,
                        principalTable: "Companies",
                        principalColumn: "company_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "job_codes",
                columns: table => new
                {
                    jobcode = table.Column<string>(type: "text", nullable: false),
                    jobpost = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    company_id = table.Column<string>(type: "character varying(50)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_job_codes", x => x.jobcode);
                    table.ForeignKey(
                        name: "FK_job_codes_Companies_company_id",
                        column: x => x.company_id,
                        principalTable: "Companies",
                        principalColumn: "company_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "job_grade_code",
                columns: table => new
                {
                    gradecode = table.Column<string>(type: "text", nullable: false),
                    gradename = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    company_id = table.Column<string>(type: "character varying(50)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_job_grade_code", x => x.gradecode);
                    table.ForeignKey(
                        name: "FK_job_grade_code_Companies_company_id",
                        column: x => x.company_id,
                        principalTable: "Companies",
                        principalColumn: "company_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "language_codes",
                columns: table => new
                {
                    langcode = table.Column<string>(type: "text", nullable: false),
                    langname = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    company_id = table.Column<string>(type: "character varying(50)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_language_codes", x => x.langcode);
                    table.ForeignKey(
                        name: "FK_language_codes_Companies_company_id",
                        column: x => x.company_id,
                        principalTable: "Companies",
                        principalColumn: "company_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "marital_status_codes",
                columns: table => new
                {
                    marstacode = table.Column<string>(type: "text", nullable: false),
                    marstaname = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    company_id = table.Column<string>(type: "character varying(50)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_marital_status_codes", x => x.marstacode);
                    table.ForeignKey(
                        name: "FK_marital_status_codes_Companies_company_id",
                        column: x => x.company_id,
                        principalTable: "Companies",
                        principalColumn: "company_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "nationality_codes",
                columns: table => new
                {
                    nationcode = table.Column<string>(type: "text", nullable: false),
                    nationame = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    company_id = table.Column<string>(type: "character varying(50)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_nationality_codes", x => x.nationcode);
                    table.ForeignKey(
                        name: "FK_nationality_codes_Companies_company_id",
                        column: x => x.company_id,
                        principalTable: "Companies",
                        principalColumn: "company_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "pay_group_code",
                columns: table => new
                {
                    paygrpcode = table.Column<string>(type: "text", nullable: false),
                    descrip = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    company_id = table.Column<string>(type: "character varying(50)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_pay_group_code", x => x.paygrpcode);
                    table.ForeignKey(
                        name: "FK_pay_group_code_Companies_company_id",
                        column: x => x.company_id,
                        principalTable: "Companies",
                        principalColumn: "company_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "pcb_code",
                columns: table => new
                {
                    pcbtabcode = table.Column<string>(type: "text", nullable: false),
                    pcbtabdesc = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    company_id = table.Column<string>(type: "character varying(50)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_pcb_code", x => x.pcbtabcode);
                    table.ForeignKey(
                        name: "FK_pcb_code_Companies_company_id",
                        column: x => x.company_id,
                        principalTable: "Companies",
                        principalColumn: "company_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "pension_code",
                columns: table => new
                {
                    pesncode = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    company_id = table.Column<string>(type: "character varying(50)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_pension_code", x => x.pesncode);
                    table.ForeignKey(
                        name: "FK_pension_code_Companies_company_id",
                        column: x => x.company_id,
                        principalTable: "Companies",
                        principalColumn: "company_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "position_codes",
                columns: table => new
                {
                    jobcode = table.Column<string>(type: "text", nullable: false),
                    company_id = table.Column<string>(type: "character varying(50)", nullable: false),
                    jobpost = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_position_codes", x => new { x.jobcode, x.company_id });
                    table.ForeignKey(
                        name: "FK_position_codes_Companies_company_id",
                        column: x => x.company_id,
                        principalTable: "Companies",
                        principalColumn: "company_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "qualification_codes",
                columns: table => new
                {
                    qlfcatid = table.Column<string>(type: "text", nullable: false),
                    qlfsubid = table.Column<string>(type: "text", nullable: false),
                    company_id = table.Column<string>(type: "character varying(50)", nullable: false),
                    qlfcatname = table.Column<string>(type: "text", nullable: false),
                    qlfsubname = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_qualification_codes", x => new { x.qlfcatid, x.qlfsubid, x.company_id });
                    table.ForeignKey(
                        name: "FK_qualification_codes_Companies_company_id",
                        column: x => x.company_id,
                        principalTable: "Companies",
                        principalColumn: "company_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "qualification_grades",
                columns: table => new
                {
                    qlfgradecode = table.Column<string>(type: "text", nullable: false),
                    company_id = table.Column<string>(type: "character varying(50)", nullable: false),
                    qlfgradename = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_qualification_grades", x => new { x.qlfgradecode, x.company_id });
                    table.ForeignKey(
                        name: "FK_qualification_grades_Companies_company_id",
                        column: x => x.company_id,
                        principalTable: "Companies",
                        principalColumn: "company_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "race_codes",
                columns: table => new
                {
                    racecode = table.Column<string>(type: "text", nullable: false),
                    racename = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    company_id = table.Column<string>(type: "character varying(50)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_race_codes", x => x.racecode);
                    table.ForeignKey(
                        name: "FK_race_codes_Companies_company_id",
                        column: x => x.company_id,
                        principalTable: "Companies",
                        principalColumn: "company_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "religion_codes",
                columns: table => new
                {
                    religncode = table.Column<string>(type: "text", nullable: false),
                    relignname = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    company_id = table.Column<string>(type: "character varying(50)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_religion_codes", x => x.religncode);
                    table.ForeignKey(
                        name: "FK_religion_codes_Companies_company_id",
                        column: x => x.company_id,
                        principalTable: "Companies",
                        principalColumn: "company_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "salutation_code",
                columns: table => new
                {
                    salucode = table.Column<string>(type: "text", nullable: false),
                    saludesc = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    company_id = table.Column<string>(type: "character varying(50)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_salutation_code", x => x.salucode);
                    table.ForeignKey(
                        name: "FK_salutation_code_Companies_company_id",
                        column: x => x.company_id,
                        principalTable: "Companies",
                        principalColumn: "company_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "section_code",
                columns: table => new
                {
                    sectiocode = table.Column<string>(type: "text", nullable: false),
                    sectioname = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    company_id = table.Column<string>(type: "character varying(50)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_section_code", x => x.sectiocode);
                    table.ForeignKey(
                        name: "FK_section_code_Companies_company_id",
                        column: x => x.company_id,
                        principalTable: "Companies",
                        principalColumn: "company_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "security_code",
                columns: table => new
                {
                    grpid = table.Column<string>(type: "text", nullable: false),
                    grpname = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    company_id = table.Column<string>(type: "character varying(50)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_security_code", x => x.grpid);
                    table.ForeignKey(
                        name: "FK_security_code_Companies_company_id",
                        column: x => x.company_id,
                        principalTable: "Companies",
                        principalColumn: "company_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "socso_code",
                columns: table => new
                {
                    soctabcode = table.Column<string>(type: "text", nullable: false),
                    soctabdesc = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    company_id = table.Column<string>(type: "character varying(50)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_socso_code", x => x.soctabcode);
                    table.ForeignKey(
                        name: "FK_socso_code_Companies_company_id",
                        column: x => x.company_id,
                        principalTable: "Companies",
                        principalColumn: "company_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "statutory_code",
                columns: table => new
                {
                    corefcode = table.Column<string>(type: "text", nullable: false),
                    compnycode = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    company_id = table.Column<string>(type: "character varying(50)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_statutory_code", x => x.corefcode);
                    table.ForeignKey(
                        name: "FK_statutory_code_Companies_company_id",
                        column: x => x.company_id,
                        principalTable: "Companies",
                        principalColumn: "company_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ThanksPages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CompanyId = table.Column<string>(type: "character varying(50)", nullable: false),
                    ThanksTitle = table.Column<string>(type: "text", nullable: false),
                    ThanksMessage = table.Column<string>(type: "text", nullable: false),
                    NextStepsMessage = table.Column<string>(type: "text", nullable: false),
                    ThanksFooter = table.Column<string>(type: "text", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ThanksPages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ThanksPages_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Companies",
                        principalColumn: "company_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "unit_code",
                columns: table => new
                {
                    unitcode = table.Column<string>(type: "text", nullable: false),
                    unitname = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    company_id = table.Column<string>(type: "character varying(50)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_unit_code", x => x.unitcode);
                    table.ForeignKey(
                        name: "FK_unit_code_Companies_company_id",
                        column: x => x.company_id,
                        principalTable: "Companies",
                        principalColumn: "company_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ve_code",
                columns: table => new
                {
                    vecode = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    company_id = table.Column<string>(type: "character varying(50)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ve_code", x => x.vecode);
                    table.ForeignKey(
                        name: "FK_ve_code_Companies_company_id",
                        column: x => x.company_id,
                        principalTable: "Companies",
                        principalColumn: "company_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Candidates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CandidateId = table.Column<string>(type: "text", nullable: false),
                    FirstName = table.Column<string>(type: "text", nullable: false),
                    MiddleName = table.Column<string>(type: "text", nullable: true),
                    LastName = table.Column<string>(type: "text", nullable: false),
                    FullName = table.Column<string>(type: "text", nullable: false),
                    NewIcNumber = table.Column<string>(type: "text", nullable: false),
                    SalutationCode = table.Column<string>(type: "text", nullable: true),
                    OldIcNumber = table.Column<string>(type: "text", nullable: true),
                    Passport = table.Column<string>(type: "text", nullable: true),
                    BirthDate = table.Column<DateTime>(type: "date", nullable: true),
                    Gender = table.Column<string>(type: "text", nullable: true),
                    MaritalStatusCode = table.Column<string>(type: "text", nullable: true),
                    RaceCode = table.Column<string>(type: "text", nullable: true),
                    ReligionCode = table.Column<string>(type: "text", nullable: true),
                    NationalityCode = table.Column<string>(type: "text", nullable: true),
                    CountryOfOriginCode = table.Column<string>(type: "text", nullable: true),
                    NativeStatus = table.Column<string>(type: "text", nullable: true),
                    RecommendationType = table.Column<string>(type: "text", nullable: true),
                    RecommendationDetails = table.Column<string>(type: "text", nullable: true),
                    Disability = table.Column<string>(type: "text", nullable: true),
                    Referee1 = table.Column<string>(type: "text", nullable: true),
                    Referee2 = table.Column<string>(type: "text", nullable: true),
                    EntryDate = table.Column<DateTime>(type: "date", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Candidates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Candidates_country_origin_codes_CountryOfOriginCode",
                        column: x => x.CountryOfOriginCode,
                        principalTable: "country_origin_codes",
                        principalColumn: "ctyorgcode",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Candidates_marital_status_codes_MaritalStatusCode",
                        column: x => x.MaritalStatusCode,
                        principalTable: "marital_status_codes",
                        principalColumn: "marstacode",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Candidates_nationality_codes_NationalityCode",
                        column: x => x.NationalityCode,
                        principalTable: "nationality_codes",
                        principalColumn: "nationcode",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Candidates_race_codes_RaceCode",
                        column: x => x.RaceCode,
                        principalTable: "race_codes",
                        principalColumn: "racecode",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Candidates_religion_codes_ReligionCode",
                        column: x => x.ReligionCode,
                        principalTable: "religion_codes",
                        principalColumn: "religncode",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Candidates_salutation_code_SalutationCode",
                        column: x => x.SalutationCode,
                        principalTable: "salutation_code",
                        principalColumn: "salucode",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Applications",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CandidateId = table.Column<Guid>(type: "uuid", nullable: false),
                    CompanyId = table.Column<string>(type: "character varying(50)", nullable: false),
                    PositionCode = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    ExportStatus = table.Column<string>(type: "text", nullable: false),
                    ProfileSnapshot = table.Column<string>(type: "jsonb", nullable: false),
                    AppliedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Applications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Applications_Candidates_CandidateId",
                        column: x => x.CandidateId,
                        principalTable: "Candidates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Applications_position_codes_PositionCode_CompanyId",
                        columns: x => new { x.PositionCode, x.CompanyId },
                        principalTable: "position_codes",
                        principalColumns: new[] { "jobcode", "company_id" },
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CandidateHobbies",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CandidateId = table.Column<Guid>(type: "uuid", nullable: false),
                    HobbyCode = table.Column<string>(type: "text", nullable: false),
                    AbilityLevel = table.Column<string>(type: "text", nullable: true),
                    LocalDescription = table.Column<string>(type: "text", nullable: true),
                    EntryDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CandidateHobbies", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CandidateHobbies_Candidates_CandidateId",
                        column: x => x.CandidateId,
                        principalTable: "Candidates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CandidateLanguages",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CandidateId = table.Column<Guid>(type: "uuid", nullable: false),
                    LanguageCode = table.Column<string>(type: "text", nullable: false),
                    ReadLevel = table.Column<string>(type: "text", nullable: true),
                    WrittenLevel = table.Column<string>(type: "text", nullable: true),
                    SpokenLevel = table.Column<string>(type: "text", nullable: true),
                    EntryDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CandidateLanguages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CandidateLanguages_Candidates_CandidateId",
                        column: x => x.CandidateId,
                        principalTable: "Candidates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CandidateResumes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CandidateId = table.Column<Guid>(type: "uuid", nullable: false),
                    FileName = table.Column<string>(type: "text", nullable: true),
                    FileContent = table.Column<byte[]>(type: "bytea", nullable: true),
                    EntryDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CandidateResumes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CandidateResumes_Candidates_CandidateId",
                        column: x => x.CandidateId,
                        principalTable: "Candidates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ContactInformation",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CandidateId = table.Column<Guid>(type: "uuid", nullable: false),
                    email = table.Column<string>(type: "text", nullable: false),
                    phone_number = table.Column<string>(type: "text", nullable: false),
                    office_number = table.Column<string>(type: "text", nullable: true),
                    other_number = table.Column<string>(type: "text", nullable: true),
                    correspondence_address = table.Column<string>(type: "text", nullable: false),
                    correspondence_phone = table.Column<string>(type: "text", nullable: true),
                    permanent_address = table.Column<string>(type: "text", nullable: true),
                    permanent_phone = table.Column<string>(type: "text", nullable: true),
                    emergency_contact_name = table.Column<string>(type: "text", nullable: true),
                    emergency_address = table.Column<string>(type: "text", nullable: true),
                    emergency_phone = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContactInformation", x => x.id);
                    table.ForeignKey(
                        name: "FK_ContactInformation_Candidates_CandidateId",
                        column: x => x.CandidateId,
                        principalTable: "Candidates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "EmploymentHistories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CandidateId = table.Column<Guid>(type: "uuid", nullable: false),
                    EmployerName = table.Column<string>(type: "text", nullable: false),
                    TelNo = table.Column<string>(type: "text", nullable: true),
                    Address = table.Column<string>(type: "text", nullable: true),
                    FromDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ToDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Latest = table.Column<bool>(type: "boolean", nullable: false),
                    IndustryCode = table.Column<string>(type: "text", nullable: true),
                    JobCode = table.Column<string>(type: "text", nullable: false),
                    JobName = table.Column<string>(type: "text", nullable: true),
                    EmphJobName = table.Column<string>(type: "text", nullable: true),
                    JobFunction = table.Column<string>(type: "text", nullable: true),
                    StartSalary = table.Column<decimal>(type: "numeric", nullable: true),
                    LastSalary = table.Column<decimal>(type: "numeric", nullable: true),
                    CessationReasonCode = table.Column<string>(type: "text", nullable: true),
                    CessationReasonDescription = table.Column<string>(type: "text", nullable: true),
                    EntryDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmploymentHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EmploymentHistories_Candidates_CandidateId",
                        column: x => x.CandidateId,
                        principalTable: "Candidates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FieldExperiences",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CandidateId = table.Column<Guid>(type: "uuid", nullable: false),
                    FieldName = table.Column<string>(type: "text", nullable: true),
                    FieldAreaCode = table.Column<string>(type: "text", nullable: true),
                    YearsOfExperience = table.Column<int>(type: "integer", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    EntryDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FieldExperiences", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FieldExperiences_Candidates_CandidateId",
                        column: x => x.CandidateId,
                        principalTable: "Candidates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Qualifications",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CandidateId = table.Column<Guid>(type: "uuid", nullable: false),
                    SchoolName = table.Column<string>(type: "text", nullable: false),
                    SchoolTelNo = table.Column<string>(type: "text", nullable: true),
                    SchoolAddress = table.Column<string>(type: "text", nullable: true),
                    JoinSchoolDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    SinceWhenDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EntryDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    QualificationCode = table.Column<string>(type: "text", nullable: false),
                    QualificationName = table.Column<string>(type: "text", nullable: true),
                    QualificationSubCode = table.Column<string>(type: "text", nullable: true),
                    QualificationSubName = table.Column<string>(type: "text", nullable: true),
                    IsHighest = table.Column<bool>(type: "boolean", nullable: false),
                    QualificationGradeCode = table.Column<string>(type: "text", nullable: true),
                    QualificationGradeName = table.Column<string>(type: "text", nullable: true),
                    QualificationGradeRank = table.Column<string>(type: "text", nullable: true),
                    CGPA = table.Column<string>(type: "text", nullable: true),
                    OtherGradeInfo = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Qualifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Qualifications_Candidates_CandidateId",
                        column: x => x.CandidateId,
                        principalTable: "Candidates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Skills",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CandidateId = table.Column<Guid>(type: "uuid", nullable: false),
                    OfficeSkills = table.Column<string>(type: "text", nullable: true),
                    OtherRelevantSkills = table.Column<string>(type: "text", nullable: true),
                    OtherSkillInformation = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Skills", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Skills_Candidates_CandidateId",
                        column: x => x.CandidateId,
                        principalTable: "Candidates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Applications_CandidateId_PositionCode_CompanyId",
                table: "Applications",
                columns: new[] { "CandidateId", "PositionCode", "CompanyId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Applications_PositionCode_CompanyId",
                table: "Applications",
                columns: new[] { "PositionCode", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_branch_code_company_id",
                table: "branch_code",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "IX_CandidateHobbies_CandidateId",
                table: "CandidateHobbies",
                column: "CandidateId");

            migrationBuilder.CreateIndex(
                name: "IX_CandidateLanguages_CandidateId",
                table: "CandidateLanguages",
                column: "CandidateId");

            migrationBuilder.CreateIndex(
                name: "IX_CandidateResumes_CandidateId",
                table: "CandidateResumes",
                column: "CandidateId");

            migrationBuilder.CreateIndex(
                name: "IX_Candidates_CandidateId",
                table: "Candidates",
                column: "CandidateId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Candidates_CountryOfOriginCode",
                table: "Candidates",
                column: "CountryOfOriginCode");

            migrationBuilder.CreateIndex(
                name: "IX_Candidates_MaritalStatusCode",
                table: "Candidates",
                column: "MaritalStatusCode");

            migrationBuilder.CreateIndex(
                name: "IX_Candidates_NationalityCode",
                table: "Candidates",
                column: "NationalityCode");

            migrationBuilder.CreateIndex(
                name: "IX_Candidates_RaceCode",
                table: "Candidates",
                column: "RaceCode");

            migrationBuilder.CreateIndex(
                name: "IX_Candidates_ReligionCode",
                table: "Candidates",
                column: "ReligionCode");

            migrationBuilder.CreateIndex(
                name: "IX_Candidates_SalutationCode",
                table: "Candidates",
                column: "SalutationCode");

            migrationBuilder.CreateIndex(
                name: "IX_cessation_reasons_company_id",
                table: "cessation_reasons",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "IX_Companies_company_id",
                table: "Companies",
                column: "company_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_company_code_company_id",
                table: "company_code",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "IX_ContactInformation_CandidateId",
                table: "ContactInformation",
                column: "CandidateId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_country_origin_codes_company_id",
                table: "country_origin_codes",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "IX_department_code_company_id",
                table: "department_code",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "IX_division_code_company_id",
                table: "division_code",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "IX_EmploymentHistories_CandidateId",
                table: "EmploymentHistories",
                column: "CandidateId");

            migrationBuilder.CreateIndex(
                name: "IX_empty_code_company_id",
                table: "empty_code",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "IX_epf_code_company_id",
                table: "epf_code",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "IX_field_area_codes_company_id",
                table: "field_area_codes",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "IX_FieldExperiences_CandidateId",
                table: "FieldExperiences",
                column: "CandidateId");

            migrationBuilder.CreateIndex(
                name: "IX_gl1_code_company_id",
                table: "gl1_code",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "IX_gl2_code_company_id",
                table: "gl2_code",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "IX_hobby_codes_company_id",
                table: "hobby_codes",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "IX_HrAdapterData_CandidateId_CompanyId",
                table: "HrAdapterData",
                columns: new[] { "CandidateId", "CompanyId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_industry_codes_company_id",
                table: "industry_codes",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "IX_job_codes_company_id",
                table: "job_codes",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "IX_job_grade_code_company_id",
                table: "job_grade_code",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "IX_language_codes_company_id",
                table: "language_codes",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "IX_marital_status_codes_company_id",
                table: "marital_status_codes",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "IX_nationality_codes_company_id",
                table: "nationality_codes",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "IX_pay_group_code_company_id",
                table: "pay_group_code",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "IX_pcb_code_company_id",
                table: "pcb_code",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "IX_pension_code_company_id",
                table: "pension_code",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "IX_position_codes_company_id",
                table: "position_codes",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "IX_qualification_codes_company_id",
                table: "qualification_codes",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "IX_qualification_grades_company_id",
                table: "qualification_grades",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "IX_Qualifications_CandidateId",
                table: "Qualifications",
                column: "CandidateId");

            migrationBuilder.CreateIndex(
                name: "IX_race_codes_company_id",
                table: "race_codes",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "IX_religion_codes_company_id",
                table: "religion_codes",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "IX_salutation_code_company_id",
                table: "salutation_code",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "IX_section_code_company_id",
                table: "section_code",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "IX_security_code_company_id",
                table: "security_code",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "IX_Skills_CandidateId",
                table: "Skills",
                column: "CandidateId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_socso_code_company_id",
                table: "socso_code",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "IX_statutory_code_company_id",
                table: "statutory_code",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "IX_ThanksPages_CompanyId",
                table: "ThanksPages",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_unit_code_company_id",
                table: "unit_code",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "IX_Users_CompanyId",
                table: "Users",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email_CompanyId",
                table: "Users",
                columns: new[] { "Email", "CompanyId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_IcNumber_CompanyId",
                table: "Users",
                columns: new[] { "IcNumber", "CompanyId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ve_code_company_id",
                table: "ve_code",
                column: "company_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Applications");

            migrationBuilder.DropTable(
                name: "branch_code");

            migrationBuilder.DropTable(
                name: "CandidateHobbies");

            migrationBuilder.DropTable(
                name: "CandidateLanguages");

            migrationBuilder.DropTable(
                name: "CandidateResumes");

            migrationBuilder.DropTable(
                name: "cessation_reasons");

            migrationBuilder.DropTable(
                name: "company_code");

            migrationBuilder.DropTable(
                name: "ContactInformation");

            migrationBuilder.DropTable(
                name: "department_code");

            migrationBuilder.DropTable(
                name: "division_code");

            migrationBuilder.DropTable(
                name: "EmploymentHistories");

            migrationBuilder.DropTable(
                name: "empty_code");

            migrationBuilder.DropTable(
                name: "epf_code");

            migrationBuilder.DropTable(
                name: "field_area_codes");

            migrationBuilder.DropTable(
                name: "FieldExperiences");

            migrationBuilder.DropTable(
                name: "gl1_code");

            migrationBuilder.DropTable(
                name: "gl2_code");

            migrationBuilder.DropTable(
                name: "hobby_codes");

            migrationBuilder.DropTable(
                name: "HrAdapterData");

            migrationBuilder.DropTable(
                name: "industry_codes");

            migrationBuilder.DropTable(
                name: "job_codes");

            migrationBuilder.DropTable(
                name: "job_grade_code");

            migrationBuilder.DropTable(
                name: "language_codes");

            migrationBuilder.DropTable(
                name: "pay_group_code");

            migrationBuilder.DropTable(
                name: "pcb_code");

            migrationBuilder.DropTable(
                name: "pension_code");

            migrationBuilder.DropTable(
                name: "qualification_codes");

            migrationBuilder.DropTable(
                name: "qualification_grades");

            migrationBuilder.DropTable(
                name: "Qualifications");

            migrationBuilder.DropTable(
                name: "section_code");

            migrationBuilder.DropTable(
                name: "security_code");

            migrationBuilder.DropTable(
                name: "Skills");

            migrationBuilder.DropTable(
                name: "socso_code");

            migrationBuilder.DropTable(
                name: "statutory_code");

            migrationBuilder.DropTable(
                name: "ThanksPages");

            migrationBuilder.DropTable(
                name: "unit_code");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "ve_code");

            migrationBuilder.DropTable(
                name: "position_codes");

            migrationBuilder.DropTable(
                name: "Candidates");

            migrationBuilder.DropTable(
                name: "country_origin_codes");

            migrationBuilder.DropTable(
                name: "marital_status_codes");

            migrationBuilder.DropTable(
                name: "nationality_codes");

            migrationBuilder.DropTable(
                name: "race_codes");

            migrationBuilder.DropTable(
                name: "religion_codes");

            migrationBuilder.DropTable(
                name: "salutation_code");

            migrationBuilder.DropTable(
                name: "Companies");
        }
    }
}
